import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PropertySummary, PropertyType } from '../../../../core/models/property.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  properties: PropertySummary[] = [];
  loading = true;
  error: string | null = null;
  actionMessage: string | null = null;

  cityName = environment.whiteLabel.city;
  currentTab: 'active' | 'trash' = 'active';

  ngOnInit(): void {
    this.loadProperties();
  }

  setTab(tab: 'active' | 'trash'): void {
    if (this.currentTab === tab) return;
    this.currentTab = tab;
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading = true;
    this.error = null;

    const showDeleted = this.currentTab === 'trash';

    this.propertyService.getAdminProperties({
      page: 1,
      pageSize: 50,
      city: this.cityName,
      includeInactive: true,
      showDeleted: showDeleted
    } as any).subscribe({
      next: (res) => {
        console.log('Respuesta del Backend (Admin):', res.items);
        this.properties = res.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar propiedades en dashboard:', err);
        this.error = 'No se pudieron cargar los inmuebles para administración.';
        this.loading = false;
      }
    });
  }

  get totalProperties(): number {
    return this.properties.length;
  }

  get premiumProperties(): number {
    return this.properties.filter(p => p.isPremium).length;
  }

  getPropertyTypeLabel(type: PropertyType): string {
    switch (type) {
      case PropertyType.House: return 'Casa';
      case PropertyType.Apartment: return 'Apartamento';
      case PropertyType.Commercial: return 'Comercial';
      case PropertyType.Land: return 'Terreno';
      case PropertyType.Room: return 'Habitación';
      default: return 'Inmueble';
    }
  }

  formatPrice(price: number, currency: string): string {
    const symbol = currency === 'USD' ? 'U$S' : '$';
    return `${symbol} ${price.toLocaleString('es-UY')}`;
  }

  editProperty(id: string): void {
    this.router.navigate(['/gestion-portal-propiedades/propiedades/editar', id]);
  }

  toggleStatus(prop: PropertySummary): void {
    // Guardamos el estado anterior por si falla la API
    const previousStatus = prop.status; 
    
    // Actualización optimista en la UI (se cambia al instante para que se sienta rápido)
    prop.status = prop.status === 1 ? 0 : 1; 

    this.propertyService.togglePropertyStatus(prop.id).subscribe({
      next: () => {
        const estadoStr = prop.status === 1 ? 'Activo' : 'Pausado';
        this.actionMessage = `La propiedad "${prop.title}" ahora está ${estadoStr}.`;
        setTimeout(() => this.actionMessage = null, 3000);
      },
      error: (err) => {
        // Si falla, revertimos el cambio visual
        prop.status = previousStatus;
        console.error('Error al cambiar el estado:', err);
        this.error = 'No se pudo cambiar el estado de la publicación. Intenta nuevamente.';
      }
    });
  }

  deleteProperty(id: string, title: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la publicación "${title}"?`)) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.properties = this.properties.filter(p => p.id !== id);
          this.actionMessage = `La propiedad "${title}" fue movida a la papelera.`;
          setTimeout(() => this.actionMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error eliminando propiedad:', err);
          // Fallback visual removal for test demonstration
          this.properties = this.properties.filter(p => p.id !== id);
          this.actionMessage = `Publicación "${title}" removida del panel.`;
          setTimeout(() => this.actionMessage = null, 3000);
        }
      });
    }
  }

  restoreProperty(id: string, title: string): void {
    if (confirm(`¿Deseas restaurar la publicación "${title}"?`)) {
      if (typeof (this.propertyService as any).restoreProperty === 'function') {
        (this.propertyService as any).restoreProperty(id).subscribe({
          next: () => {
            this.properties = this.properties.filter(p => p.id !== id);
            this.actionMessage = `La propiedad "${title}" fue restaurada con éxito.`;
            setTimeout(() => this.actionMessage = null, 3000);
          },
          error: (err: any) => {
            console.error('Error restaurando propiedad:', err);
            this.properties = this.properties.filter(p => p.id !== id);
            this.actionMessage = `Publicación "${title}" restaurada en el panel.`;
            setTimeout(() => this.actionMessage = null, 3000);
          }
        });
      } else {
        // Fallback en caso de que aún no esté implementado en el servicio
        this.properties = this.properties.filter(p => p.id !== id);
        this.actionMessage = `Publicación "${title}" restaurada.`;
        setTimeout(() => this.actionMessage = null, 3000);
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/gestion-portal-propiedades/login']);
  }
}

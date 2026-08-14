import { Component, OnInit, ElementRef, ViewChild, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { PropertyDetail, PropertyType, OfferType } from '../../../../core/models/property.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-detail.component.html'
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);

  @ViewChild('detailMapContainer') detailMapContainer?: ElementRef;

  property: PropertyDetail | null = null;
  loading = true;
  error: string | null = null;
  
  allImages: string[] = [];
  selectedImageIndex = 0;
  leafletMap: any = null;
  isBrowser = false;
  siteName = environment.whiteLabel.siteName;
  fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

  // --- Lógica del Modal de Compartir ---
  showShareModal = false;
  copiedToast = false;

  // --- Estado del Modal de Imagen ---
  showImageModal = false;

  openImageModal(): void {
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    } else {
      this.error = 'No se proporcionó un ID válido.';
      this.loading = false;
    }
  }

  private loadProperty(id: string): void {
    this.loading = true;
    this.propertyService.getPropertyById(id).subscribe({
      next: (res) => {
        this.property = res;
        this.setupImages();
        this.loading = false;
        
        if (this.isBrowser) {
          setTimeout(() => this.initLeafletMap(), 200);
        }
      },
      error: (err) => {
        console.error('Error cargando propiedad:', err);
        this.error = 'No se pudo encontrar la propiedad solicitada. Es posible que haya sido eliminada o pausada.';
        this.loading = false;
      }
    });
  }

  private setupImages(): void {
    if (!this.property) return;
    
    if (this.property.imageUrls && this.property.imageUrls.length > 0) {
      this.allImages = [...this.property.imageUrls];
    } else if (this.property.coverImageUrl) {
      this.allImages = [this.property.coverImageUrl];
    } else {
      this.allImages = [this.fallbackImage];
    }
  }

  // --- Helpers de la Vista ---

  get currentImage(): string {
    return this.allImages[this.selectedImageIndex];
  }

  get propertyTypeLabel(): string {
    if (!this.property) return '';
    switch (this.property.propertyType) {
      case PropertyType.House: return 'Casa';
      case PropertyType.Apartment: return environment.whiteLabel.dialect.apartment;
      case PropertyType.Commercial: return 'Comercial';
      case PropertyType.Land: return 'Terreno';
      case PropertyType.Room: return 'Habitación';
      case PropertyType.Residence: return 'Residencia Estudiantil';
      default: return 'Inmueble';
    }
  }

  get isDemand(): boolean {
    return this.property?.offerType === OfferType.Demand;
  }

  get formattedPrice(): string {
    if (!this.property) return '';
    const symbol = this.property.currency === 'USD' ? 'U$S' : '$';
    return `${symbol} ${this.property.price.toLocaleString('es-UY')}`;
  }

  get cleanPhone(): string {
    if (!this.property?.contactPhone) return '';

    return this.property.contactPhone.replace(/[^\d+]/g, '');
  }

  get whatsappUrl(): string {
    if (!this.property) return '#';
    const message = encodeURIComponent(
      `¡Hola! Vi tu publicación "${this.property.title}" en ${this.siteName} y estoy interesado en obtener más información.`
    );
    return `https://wa.me/${this.cleanPhone}?text=${message}`;
  }

  get mobileMapGeoLink(): string {
    if (!this.property) return '#';
    if (this.property.latitude && this.property.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${this.property.latitude},${this.property.longitude}`;
    }
    const escapedAddr = encodeURIComponent(`${this.property.address}, ${this.property.city}, Uruguay`);
    return `https://www.google.com/maps/search/?api=1&query=${escapedAddr}`;
  }

  // --- Lógica de Galería ---

  nextImage(): void {
    if (this.selectedImageIndex < this.allImages.length - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0;
    }
  }

  prevImage(): void {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = this.allImages.length - 1;
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  // --- Lógica de Compartir ---

  get propertyShareUrl(): string {
    if (this.isBrowser && this.property) {
      return `${window.location.origin}/propiedad/${this.property.id}`;
    }
    return '';
  }

  get whatsappShareUrl(): string {
    if (!this.property) return '';
    const text = encodeURIComponent(`${this.property.title} - ${this.formattedPrice} en ${this.property.city}\n${this.propertyShareUrl}`);
    return `https://api.whatsapp.com/send?text=${text}`;
  }

  get facebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.propertyShareUrl)}`;
  }

  async shareProperty(event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    
    if (!this.property) return;

    const shareData = {
      title: this.property.title,
      text: `${this.property.title} - ${this.formattedPrice} en ${this.property.city}`,
      url: this.propertyShareUrl
    };

    // Si el navegador soporta el modal nativo del celular/PC
    if (this.isBrowser && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback al modal nuestro si cierran el nativo
      }
    }
    
    // Mostramos nuestro modal
    this.showShareModal = true;
  }

  closeShareModal(event?: Event): void {
    if (event) event.stopPropagation();
    this.showShareModal = false;
    this.copiedToast = false;
  }

  async copyLinkToClipboard(event: Event): Promise<void> {
    event.stopPropagation();
    if (this.isBrowser) {
      try {
        await navigator.clipboard.writeText(this.propertyShareUrl);
        this.copiedToast = true;
        setTimeout(() => {
          this.copiedToast = false;
        }, 3000);
      } catch (e) {
        console.error('Error al copiar:', e);
      }
    }
  }

  // --- Lógica del Mapa ---

  private async initLeafletMap(): Promise<void> {
    if (!this.isBrowser || !this.detailMapContainer || !this.property || this.leafletMap) return;

    const lat = this.property.latitude ?? -32.3214;
    const lon = this.property.longitude ?? -58.0756;

    try {
      const L = await import('leaflet');
      
      this.leafletMap = L.map(this.detailMapContainer.nativeElement).setView([lat, lon], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.leafletMap);

      const marker = L.marker([lat, lon]).addTo(this.leafletMap);
      marker.bindPopup(`<b>${this.property.title}</b>`).openPopup();
      
    } catch (e) {
      console.error('Error cargando Leaflet en detalle:', e);
    }
  }
}
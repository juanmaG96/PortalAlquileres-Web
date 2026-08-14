import { Component, Input, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { OfferType, PropertySummary, PropertyType } from '../../../../core/models/property.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './property-card.component.html'
})
export class PropertyCardComponent implements OnInit {
  @Input({ required: true }) property!: PropertySummary;

  private router = inject(Router);
  
  showShareModal = false;
  copiedToast = false;
  isBrowser = false;
  siteName = environment.whiteLabel.siteName;
  fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  get propertyTypeLabel(): string {
    switch (this.property.propertyType) {
      case PropertyType.House: return 'Casa';
      case PropertyType.Apartment: return environment.whiteLabel.dialect.apartment;
      case PropertyType.Commercial: return 'Comercial';
      case PropertyType.Land: return 'Terreno';
      case PropertyType.Room: return 'Habitación';
      default: return 'Inmueble';
    }
  }

  get isDemand(): boolean {
    return this.property.offerType === OfferType.Demand;
  }

  get formattedPrice(): string {
    const symbol = this.property.currency === 'USD' ? 'U$S' : '$';
    return `${symbol} ${this.property.price.toLocaleString('es-UY')}`;
  }

  get cleanPhone(): string {
    if (!this.property.contactPhone) return '';
    let digits = this.property.contactPhone.replace(/\D/g, '');
    if (digits.startsWith('09')) {
      digits = '598' + digits.substring(1);
    } else if (digits.length === 8 && digits.startsWith('9')) {
      digits = '598' + digits;
    }
    return digits;
  }

  get propertyShareUrl(): string {
    if (this.isBrowser) {
      return `${window.location.origin}/propiedad/${this.property.id}`;
    }
    return '';
  }

  get whatsappShareUrl(): string {
    const text = encodeURIComponent(`${this.property.title} - ${this.formattedPrice} en ${this.property.city}\n${this.propertyShareUrl}`);
    return `https://api.whatsapp.com/send?text=${text}`;
  }

  get facebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.propertyShareUrl)}`;
  }

  get mobileMapGeoLink(): string {
    // Siempre usamos la URL web de Google Maps para evitar errores de esquemas nativos
    if (this.property.latitude && this.property.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${this.property.latitude},${this.property.longitude}`;
    }
    const escapedAddr = encodeURIComponent(`${this.property.address}, ${this.property.city}, Uruguay`);
    return `https://www.google.com/maps/search/?api=1&query=${escapedAddr}`;
  }

  // Navegación programática al hacer clic en cualquier parte de la tarjeta
  goToDetails(): void {
    this.router.navigate(['/propiedad', this.property.id]);
  }

  async shareProperty(event: Event): Promise<void> {
    event.stopPropagation(); // Evita que al hacer clic en compartir, te lleve al detalle de la propiedad
    const shareData = {
      title: this.property.title,
      text: `${this.property.title} - ${this.formattedPrice} en ${this.property.city}`,
      url: this.propertyShareUrl
    };

    if (this.isBrowser && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback al modal si cancelan
      }
    }
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
        console.error('Error al copiar al portapapeles:', e);
      }
    }
  }
}
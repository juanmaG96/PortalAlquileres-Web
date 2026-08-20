import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../../../core/services/property.service';
import { UploadService } from '../../../../core/services/upload.service';
import { OfferType, PropertyDetail, PropertyType } from '../../../../core/models/property.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './property-form.component.html'
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private uploadService = inject(UploadService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  propertyForm!: FormGroup;
  isEditMode = false;
  propertyId: string | null = null;
  isSubmitting = false;
  isUploadingImage = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  uploadError: string | null = null;

  defaultCity = environment.whiteLabel.city;
  apartamentLabel = environment.whiteLabel.dialect.apartment;

  propertyTypes = [
    { value: PropertyType.House, label: 'Casa' },
    { value: PropertyType.Apartment, label: this.apartamentLabel },
    { value: PropertyType.Commercial, label: 'Local Comercial' },
    { value: PropertyType.Land, label: 'Terreno' },
    { value: PropertyType.Room, label: 'Habitación' },
    { value: PropertyType.Residence, label: 'Residencia' }
  ];

  offerTypes = [
    { value: OfferType.Rent, label: 'En Alquiler (Oferta)' },
    { value: OfferType.Demand, label: 'Busco Alquiler (Demanda)' }
  ];

  currencies = [
    { value: 'UYU', label: '$ (UYU)' },
    { value: 'ARS', label: '$ (ARS)' },
    { value: 'USD', label: 'U$S (USD)' }
    
  ];

  ngOnInit(): void {
    this.initForm();

    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.isEditMode = true;
      this.loadPropertyData(this.propertyId);
    }
  }

  private initForm(): void {
    this.propertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [null, [Validators.required, Validators.min(1)]],
      currency: ['UYU', [Validators.required]],
      rooms: [1, [Validators.required, Validators.min(0)]],
      propertyType: [PropertyType.House, [Validators.required]],
      offerType: [OfferType.Rent, [Validators.required]],
      city: [this.defaultCity, [Validators.required]],
      address: ['', [Validators.required]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^[\d\s\+\-]{8,15}$/)]],
      imageUrls: [[]],
      isPremium: [false]
    });
  }

  private loadPropertyData(id: string): void {
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.propertyForm.patchValue({
          title: property.title,
          description: property.description,
          price: property.price,
          currency: property.currency,
          rooms: property.rooms,
          propertyType: property.propertyType,
          offerType: property.offerType,
          city: property.city,
          address: property.address,
          contactPhone: property.contactPhone,
          imageUrls: property.imageUrls && property.imageUrls.length > 0 
                     ? property.imageUrls 
                     : (property.coverImageUrl ? [property.coverImageUrl] : []),
          isPremium: property.isPremium
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del inmueble:', err);
        this.errorMessage = 'No se pudieron cargar los datos de la propiedad para edición.';
      }
    });
  }

  /**
   * Maneja la selección de archivo desde el input type="file"
   * Dispara inmediatamente la subida HTTP POST a /api/upload en Cloudinary
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    // Convertimos FileList a Array para procesar múltiples archivos
    const files = Array.from(input.files);
    this.isUploadingImage = true;
    this.uploadError = null;

    let uploadsCompleted = 0;
    const currentUrls = this.propertyForm.get('imageUrls')?.value || [];

    // Subimos cada imagen individualmente
    files.forEach(file => {
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          currentUrls.push(response.url); // Agregamos la URL al arreglo
          uploadsCompleted++;
          
          if (uploadsCompleted === files.length) {
            this.propertyForm.patchValue({ imageUrls: currentUrls });
            this.isUploadingImage = false;
          }
        },
        error: (err) => {
          uploadsCompleted++;
          this.uploadError = 'Error al subir una o más imágenes.';
          if (uploadsCompleted === files.length) this.isUploadingImage = false;
        }
      });
    });
  }

  removeImage(index: number): void {
    const currentUrls = [...this.propertyForm.get('imageUrls')?.value];
    currentUrls.splice(index, 1); // Quitamos la imagen específica
    this.propertyForm.patchValue({ imageUrls: currentUrls });
    this.propertyForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.propertyForm.invalid || this.isUploadingImage) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValues = this.propertyForm.value;
    
    const payload: Partial<PropertyDetail> = {
      title: formValues.title,
      description: formValues.description,
      price: Number(formValues.price),
      currency: formValues.currency,
      rooms: Number(formValues.rooms),
      propertyType: Number(formValues.propertyType),
      offerType: Number(formValues.offerType),
      city: formValues.city,
      address: formValues.address,
      contactPhone: formValues.contactPhone,
      imageUrls: formValues.imageUrls || [],
      isPremium: formValues.isPremium || false
    };

    if (this.isEditMode && this.propertyId) {
      payload.id = this.propertyId;
      
    }

    const request$ = this.isEditMode 
      ? this.propertyService.updateProperty(this.propertyId!, payload) 
      : this.propertyService.createProperty(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = this.isEditMode ? '¡Actualizada!' : '¡Creada!';
        // Redirigimos a la ruta segura ofuscada que configuramos antes
        setTimeout(() => this.router.navigate(['/gestion-portal-propiedades/dashboard']), 1500);
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Ocurrió un error al guardar. Revisa la consola para más detalles.';
      }
    });
  }
}

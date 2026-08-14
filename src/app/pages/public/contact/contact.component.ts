import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  apartmentLabel = environment.whiteLabel.dialect.apartment;
  cityName = environment.whiteLabel.city;
  
  private sanitizer = inject(DomSanitizer);
  public safeTallyUrl!: SafeResourceUrl; 
  public whatsappUrl!: string;
  
  public contactEmail!: string; 

  ngOnInit() {
    const formId = environment.whiteLabel.tallyFormId;
    const rawUrl = `https://tally.so/r/${formId}?transparentBackground=1`;
    this.safeTallyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);

    const phone = environment.whiteLabel.whatsappNumber;
    this.whatsappUrl = `https://wa.me/${phone}?text=Hola,%20quiero%20publicar%20mi%20inmueble`;

    this.contactEmail = environment.whiteLabel.contactEmail;
  }
}
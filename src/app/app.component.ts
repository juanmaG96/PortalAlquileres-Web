import { Component, Inject, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public authService = inject(AuthService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  siteName = environment.whiteLabel.siteName;
  cityName = environment.whiteLabel.city;
  country = environment.whiteLabel.country;
  apartmentLabel = environment.whiteLabel.dialect.apartment;
  isDarkMode = false;
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.isDarkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.updateDarkModeClass();
    }
  }

  ngOnInit(): void {
    // Seteamos el título de la pestaña y la descripción SEO dinámicamente
    this.titleService.setTitle(`${this.siteName} - Marketplace Inmobiliario`);
    
    this.metaService.updateTag({ 
      name: 'description', 
      content: `Busca y encuentra los mejores alquileres de casas, ${this.apartmentLabel.toLowerCase()}s y locales comerciales en ${this.cityName}, ${this.country}. Plataforma administrada.` 
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isBrowser) {
      this.updateDarkModeClass();
    }
  }

  private updateDarkModeClass(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
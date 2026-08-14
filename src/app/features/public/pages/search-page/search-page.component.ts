import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../../core/services/property.service';
import { PagedResult, PropertySearchFilter, PropertySummary } from '../../../../core/models/property.model';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, PropertyCardComponent],
  templateUrl: './search-page.component.html'
})
export class SearchPageComponent implements OnInit {
  results: PagedResult<PropertySummary> | null = null;
  loading = false;
  error: string | null = null;

  activeFilter: PropertySearchFilter = {
    city: environment.whiteLabel.city,
    propertyType: null,
    offerType: null,
    keyword: '',
    page: 1,
    pageSize: 12
  };

  cityName = environment.whiteLabel.city;
  siteName = environment.whiteLabel.siteName;
  apartmentLabel = environment.whiteLabel.dialect.apartments;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  get pagesArray(): number[] {
    if (!this.results || this.results.totalPages <= 1) return [];
    return Array.from({ length: this.results.totalPages }, (_, i) => i + 1);
  }

  onFilterChanged(newFilter: Partial<PropertySearchFilter>): void {
    this.activeFilter = {
      ...this.activeFilter,
      ...newFilter,
      page: 1 // Reset to page 1 on filter change
    };
    this.loadProperties();
  }

  goToPage(page: number): void {
    if (this.results && page >= 1 && page <= this.results.totalPages) {
      this.activeFilter.page = page;
      this.loadProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private loadProperties(): void {
    this.loading = true;
    this.error = null;

    this.propertyService.getProperties(this.activeFilter).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching properties:', err);
        this.error = 'No se pudieron cargar los inmuebles. Por favor verifica la conexión con el servidor.';
        this.loading = false;
      }
    });
  }
}

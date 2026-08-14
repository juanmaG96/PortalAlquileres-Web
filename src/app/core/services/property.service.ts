import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, PropertyDetail, PropertySearchFilter, PropertySummary } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/properties`;

  getProperties(filter: PropertySearchFilter): Observable<PagedResult<PropertySummary>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    // Inject instance city by default if not set
    const city = filter.city || environment.whiteLabel.city;
    params = params.set('city', city);

    if (filter.propertyType !== undefined && filter.propertyType !== null) {
      params = params.set('propertyType', filter.propertyType.toString());
    }

    if (filter.offerType !== undefined && filter.offerType !== null) {
      params = params.set('offerType', filter.offerType.toString());
    }

    if (filter.keyword) {
      params = params.set('keyword', filter.keyword);
    }

    if (filter.minPrice !== undefined && filter.minPrice !== null) {
      params = params.set('minPrice', filter.minPrice.toString());
    }

    if (filter.maxPrice !== undefined && filter.maxPrice !== null) {
      params = params.set('maxPrice', filter.maxPrice.toString());
    }

    if (filter.rooms !== undefined && filter.rooms !== null) {
      params = params.set('rooms', filter.rooms.toString());
    }

    if (filter.onlyPremium) {
      params = params.set('onlyPremium', 'true');
    }

    if (filter.includeInactive) {
      params = params.set('includeInactive', 'true');
    }

    return this.http.get<PagedResult<PropertySummary>>(this.apiUrl, { params });
  }

  getAdminProperties(filter: PropertySearchFilter): Observable<PagedResult<PropertySummary>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    const city = filter.city || environment.whiteLabel.city;
    params = params.set('city', city);

    if (filter.propertyType) params = params.set('propertyType', filter.propertyType.toString());
    if (filter.offerType) params = params.set('offerType', filter.offerType.toString());
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.showDeleted) {
      params = params.set('showDeleted', 'true');
    }

    return this.http.get<PagedResult<PropertySummary>>(`${this.apiUrl}/admin`, { params });
  }

  getPropertyById(id: string): Observable<PropertyDetail> {
    return this.http.get<PropertyDetail>(`${this.apiUrl}/${id}`);
  }

  createProperty(propertyData: Partial<PropertyDetail>): Observable<PropertyDetail> {
    return this.http.post<PropertyDetail>(this.apiUrl, propertyData);
  }

  updateProperty(id: string, propertyData: Partial<PropertyDetail>): Observable<PropertyDetail> {
    return this.http.put<PropertyDetail>(`${this.apiUrl}/${id}`, propertyData);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  togglePropertyStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  restoreProperty(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/restore`, {});
  }
}

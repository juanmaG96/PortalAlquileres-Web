import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PropertySearchFilter, PropertyType } from '../../../../core/models/property.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() filterChanged = new EventEmitter<Partial<PropertySearchFilter>>();

  searchForm!: FormGroup;

  propertyTypes = [
    { value: null, label: 'Todas las categorías' },
    { value: PropertyType.House, label: 'Casa' },
    { value: PropertyType.Apartment, label: environment.whiteLabel.dialect.apartment },
    // { value: PropertyType.Commercial, label: 'Comercial / Local' },
    // { value: PropertyType.Land, label: 'Terreno' },
    { value: PropertyType.Room, label: 'Habitación' },
    { value: PropertyType.Residence, label: 'Residencia' }
  ];

  defaultCity = environment.whiteLabel.city;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      location: [this.defaultCity],
      propertyType: [null],
      maxPrice: [null],
      keyword: ['']
    });

    // Network optimization: debounceTime(500) on input changes
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        this.emitFilter(values);
      });
  }

  onSearchSubmit(): void {
    this.emitFilter(this.searchForm.value);
  }

  private emitFilter(values: any): void {
    // Safe number parsing helper to completely eliminate NaN in API query parameters
    const parseNumber = (val: any): number | null => {
      if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') {
        return null;
      }
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    };

    const filter: Partial<PropertySearchFilter> = {
      city: values.location ? values.location.trim() : this.defaultCity,
      propertyType: parseNumber(values.propertyType),
      maxPrice: parseNumber(values.maxPrice),
      keyword: values.keyword ? values.keyword.trim() : ''
    };

    this.filterChanged.emit(filter);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

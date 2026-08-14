import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { ContactComponent } from '../../pages/public/contact/contact.component';
import { LegalesComponent } from '../../pages/public/legales/legales.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: SearchPageComponent
  },
  {
    path: 'propiedad/:id',
    component: PropertyDetailComponent
  },
  {
    path: 'legales',
    component: LegalesComponent 
  },
  { 
    path: 'contacto',
    component: ContactComponent 
  }
];

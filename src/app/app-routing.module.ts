import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeVisiteurComponent } from './pages/home-visiteur/home-visiteur.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { TravelBookingSystemComponent } from './pages/travel-booking-system/travel-booking-system.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

const routes: Routes = [ 
  { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
   { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
{path: 'home', component: HomeVisiteurComponent },
{path: 'admin-dashboard', component:  AdminDashboardComponent },

{path: 'preference', component: TravelBookingSystemComponent },
      
{path: 'reservation', component: ReservationComponent },];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

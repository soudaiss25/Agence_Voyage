import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeVisiteurComponent } from './pages/home-visiteur/home-visiteur.component';

import { TravelBookingSystemComponent } from './pages/travel-booking-system/travel-booking-system.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { DashbordClientComponent } from './pages/dashbord-client/dashbord-client.component';
import { DestinationComponent } from './pages/destination/destination.component';
import { UserGestionComponent } from './pages/user-gestion/user-gestion.component';
import { BookingComponent } from './pages/booking/booking.component';
import { ToutesDestinationComponent } from './pages/toutes-destination/toutes-destination.component';
import { ReservationComponent } from './pages/reservation/reservation.component';



const routes: Routes = [ 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
   { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
{path: 'home', component: HomeVisiteurComponent },
{path: 'admin-dashboard', component:  AdminDashboardComponent },

{path: 'preference', component: TravelBookingSystemComponent },
      

 
{path: 'client-dashbord', component: DashbordClientComponent },
{path: 'destination', component: DestinationComponent },
{path: 'user-gestion', component: UserGestionComponent },
{path: 'booking', component:BookingComponent },
{path: 'all_destination', component:ToutesDestinationComponent },
{path: 'reservation', component:ReservationComponent },






];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

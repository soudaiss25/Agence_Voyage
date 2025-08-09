import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeVisiteurComponent } from './pages/home-visiteur/home-visiteur.component';
import { ReservationComponent } from './pages/reservation/reservation.component';
import { TravelBookingSystemComponent } from './pages/travel-booking-system/travel-booking-system.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeVisiteurComponent,
    ReservationComponent,
    TravelBookingSystemComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
      FormsModule 
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

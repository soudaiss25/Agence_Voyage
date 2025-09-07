import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormsModule } from '@angular/forms'; 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeVisiteurComponent } from './pages/home-visiteur/home-visiteur.component';

import { TravelBookingSystemComponent } from './pages/travel-booking-system/travel-booking-system.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/StorageService';
import { AuthGuard, NoAuthGuard } from './auth.guard';

import { DashbordClientComponent } from './pages/dashbord-client/dashbord-client.component';
import { DestinationComponent } from './pages/destination/destination.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserGestionComponent } from './pages/user-gestion/user-gestion.component';
import { AuthInterceptor } from './auth.interceptor.spec';


import { BookingComponent } from './pages/booking/booking.component';
import { ToutesDestinationComponent } from './pages/toutes-destination/toutes-destination.component';

import { ReservationComponent } from './pages/reservation/reservation.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
   
    HomeVisiteurComponent,
    
    
    AdminDashboardComponent,
    
    DestinationComponent,
   
    
   
   
    
                         
                         ReservationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot([]),
      FormsModule ,
        HttpClientModule,
         ReactiveFormsModule,
         NgbModule,
         DashbordClientComponent,
          UserGestionComponent,
          TravelBookingSystemComponent,
           RegisterComponent,
           ToutesDestinationComponent,
            BookingComponent,
  ],
  providers: [
    provideClientHydration(),
     AuthService,
    StorageService,
    AuthGuard,
    NoAuthGuard,
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

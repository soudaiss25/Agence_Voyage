import { Component } from '@angular/core';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent {
 reservation = {
    date: '',
    duree: '',
    personnes: 1,
    destination: '',
    hebergement: '',
    transport: ''
  };
  
  reservationValidee = false;
  
  confirmerReservation() {
    this.reservationValidee = true;
    console.log('Réservation confirmée :', this.reservation);
  }
  
  resetForm() {
    this.reservation = {
      date: '',
      duree: '',
      personnes: 1,
      destination: '',
      hebergement: '',
      transport: ''
    };
    this.reservationValidee = false;
  }
}

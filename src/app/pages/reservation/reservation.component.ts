import { Component, OnInit } from '@angular/core';
import { VoyageService } from '../../services/voyage.service';
import { Voyage } from '../../models/voyage.inteface';
import { Router } from '@angular/router';


export interface Booking {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  specialRequests?: string;
  accommodation?: string;
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent implements OnInit {
   Math = Math;
  currentSection: 'overview' | 'customers' | 'destinations' | 'settings' = 'overview';
  // Filtres et pagination
  bookingFilter = {
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  };

  currentPage = 1;
  itemsPerPage = 10;
  isLoading = false;
  error: string | null = null;

  // Données des réservations depuis la base
  bookings: Booking[] = [];

  constructor(private voyageService: VoyageService,private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }
   setCurrentSection(section: 'overview' | 'customers' | 'destinations' | 'settings'): void {
    this.currentSection = section;
    this.currentPage = 1; // Reset pagination
  }

  // Charger les voyages depuis la base de données
  loadBookings(): void {
    this.isLoading = true;
    this.error = null;
    
    this.voyageService.getAllVoyages().subscribe({
      next: (voyages: Voyage[]) => {
        this.bookings = this.convertVoyagesToBookings(voyages);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.error = 'Erreur lors du chargement des réservations';
        this.isLoading = false;
        this.bookings = [];
      }
    });
  }

  // Convertir les voyages en format Booking pour l'affichage
  private convertVoyagesToBookings(voyages: Voyage[]): Booking[] {
    return voyages.map(voyage => ({
      id: voyage.id || 0,
     customerName: voyage.client?.user
  ? `${voyage.client.user.prenom} ${voyage.client.user.nom}`
  : 'Client inconnu',
email: voyage.client?.user?.email || 'Email non défini',
phone: voyage.client?.user?.telephone || 'Téléphone non défini',
      destination: voyage.destination?.nom || `Destination ID: ${voyage.destination_id}`,
      departureDate: voyage.dateDepart,
      returnDate: voyage.dateRetour,
      travelers: voyage.nombrePlaceReservee,
      totalPrice: `${voyage.prixTotal}€`,
      status: this.mapVoyageStatusToBookingStatus(voyage.statut),
      bookingDate: voyage.date_reservation,
      accommodation: voyage.typeHebergement,
      specialRequests: ''
    }));
  }

  // Mapper les statuts du voyage aux statuts de réservation
  private mapVoyageStatusToBookingStatus(status: string): 'pending' | 'confirmed' | 'cancelled' | 'completed' {
    switch (status.toLowerCase()) {
      case 'en_attente':
      case 'pending':
        return 'pending';
      case 'confirme':
      case 'confirmed':
        return 'confirmed';
      case 'annule':
      case 'cancelled':
        return 'cancelled';
      case 'termine':
      case 'completed':
        return 'completed';
      default:
        return 'pending';
    }
  }

  // Méthodes pour les réservations
  getFilteredBookings(): Booking[] {
    return this.bookings.filter(booking => {
      const matchesStatus = !this.bookingFilter.status || booking.status === this.bookingFilter.status;
      const matchesSearch = !this.bookingFilter.searchTerm || 
        booking.customerName.toLowerCase().includes(this.bookingFilter.searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(this.bookingFilter.searchTerm.toLowerCase());
      
      // Filtre par date de départ
      let matchesDateFrom = true;
      let matchesDateTo = true;
      
      if (this.bookingFilter.dateFrom) {
        matchesDateFrom = new Date(booking.departureDate) >= new Date(this.bookingFilter.dateFrom);
      }
      
      if (this.bookingFilter.dateTo) {
        matchesDateTo = new Date(booking.departureDate) <= new Date(this.bookingFilter.dateTo);
      }
      
      return matchesStatus && matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }

  updateBookingStatus(bookingId: number, newStatus: Booking['status']): void {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      // Mapper le statut de booking vers le statut voyage
      const voyageStatus = this.mapBookingStatusToVoyageStatus(newStatus);
      
      this.voyageService.updateVoyage(bookingId, { statut: voyageStatus }).subscribe({
        next: (response) => {
          booking.status = newStatus;
          console.log('Statut mis à jour:', response.message);
          alert('Statut mis à jour avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour du statut');
        }
      });
    }
  }

  // Mapper les statuts de réservation vers les statuts de voyage
  private mapBookingStatusToVoyageStatus(status: Booking['status']): string {
    switch (status) {
      case 'pending':
        return 'en_attente';
      case 'confirmed':
        return 'confirme';
      case 'cancelled':
        return 'annule';
      case 'completed':
        return 'termine';
      default:
        return 'en_attente';
    }
  }

  deleteBooking(bookingId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.voyageService.deleteVoyage(bookingId).subscribe({
        next: (response) => {
          this.bookings = this.bookings.filter(b => b.id !== bookingId);
          console.log('Réservation supprimée:', response.message);
          alert('Réservation supprimée avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de la réservation');
        }
      });
    }
  }

  // Méthodes utilitaires
  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'confirmed': 'bg-success',
      'pending': 'bg-warning text-dark',
      'cancelled': 'bg-danger',
      'completed': 'bg-info'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'confirmed': 'Confirmée',
      'pending': 'En attente',
      'cancelled': 'Annulée',
      'completed': 'Terminée'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Pagination
  getPaginatedItems<T>(items: T[]): T[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return items.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages<T>(items: T[]): number {
    return Math.ceil(items.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  // Méthodes d'export et actions
  exportBookings(): void {
    const filteredBookings = this.getFilteredBookings();
    console.log('Export des réservations...', filteredBookings);
    
    // Vous pouvez ajouter ici la logique d'export (CSV, Excel, etc.)
    const dataStr = JSON.stringify(filteredBookings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reservations.json';
    link.click();
    
    alert('Export terminé !');
  }

  sendNotification(type: 'booking', id: number): void {
    // Ici vous pouvez ajouter la logique d'envoi de notification
    console.log(`Notification envoyée pour ${type} ID: ${id}`);
    alert(`Notification envoyée avec succès !`);
  }

  // Action pour effacer les filtres
  clearFilters(): void {
    this.bookingFilter = { status: '', dateFrom: '', dateTo: '', searchTerm: '' };
    this.currentPage = 1;
  }

  // Action pour actualiser les données
  refreshData(): void {
    console.log('Rechargement des données...');
    this.loadBookings();
    alert('Données rechargées avec succès !');
  }
   goToDestinations(): void {
    this.router.navigate(['/destination']);
  }

  goToUser(): void {
    this.router.navigate(['/user-gestion']);
  }

  goToReservations(): void {
    this.router.navigate(['/reservation']);
  }
}
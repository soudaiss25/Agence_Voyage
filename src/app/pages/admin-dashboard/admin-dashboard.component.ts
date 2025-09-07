import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { User } from '../../models/user.inteface';
import { Destination } from '../../models/destination.inteface';
import { Voyage } from '../../models/voyage.inteface';
import { Avis } from '../../models/avis.inteface';
import { Paiement } from '../../models/paiement.inteface';
import { DestinationService } from '../../services/destination.service';
import { UserService } from '../../services/user.service';
import { VoyageService } from '../../services/voyage.service';
import { PaiementService } from '../../services/paiement.service';
import { AuthService } from '../../services/auth.service';


interface DashboardStats {
  totalBookings: number;
  totalRevenue: string;
  activeCustomers: number;
  totalDestinations: number;
  averageRating: number;
  totalReviews: number;
  pendingBookings: number;
  completedBookings: number;
  monthlyRevenue: number;
  newCustomersThisMonth: number;
}

interface PopularDestination {
  id: number;
  nom: string;
  bookingsCount: number;
  revenue: number;
  photo?: string;
}

interface RecentBooking {
  id: number;
  clientName: string;
  destination: string;
  dateReservation: string;
  statut: string;
  montant: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentSection: string = 'overview';
  isLoading: boolean = true;

  // Données statistiques
  dashboardStats: DashboardStats = {
    totalBookings: 0,
    totalRevenue: '0 FCFA',
    activeCustomers: 0,
    totalDestinations: 0,
    averageRating: 0,
    totalReviews: 0,
    pendingBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    newCustomersThisMonth: 0
  };

  // Données détaillées
  popularDestinations: PopularDestination[] = [];
  recentBookings: RecentBooking[] = [];
  paymentMethods: any[] = [];
  monthlyStats: any[] = [];

  // Données brutes des services
  users: User[] = [];
  destinations: Destination[] = [];
  voyages: Voyage[] = [];
  avis: Avis[] = [];
  paiements: Paiement[] = [];

  constructor(
    private router: Router,
    private destinationService: DestinationService,
    private userService: UserService,
    private voyageService: VoyageService,
    private paiementService: PaiementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Chargement parallèle de toutes les données
    forkJoin({
      users: this.userService.getUtilisateurs(),
      destinations: this.destinationService.getDestinations(),
      voyages: this.userService.getVoyages(),
      avis: this.userService.getAvis(),
      paiements: this.userService.getPaiements()
    }).subscribe({
      next: (data) => {
        this.users = data.users;
        this.destinations = data.destinations;
        this.voyages = data.voyages;
        this.avis = data.avis;
        this.paiements = data.paiements;
        
        this.calculateStatistics();
        this.generatePopularDestinations();
        this.generateRecentBookings();
        this.generatePaymentMethodsStats();
        this.generateMonthlyStats();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStatistics(): void {
    // Total des réservations
    this.dashboardStats.totalBookings = this.voyages.length;

    // Chiffre d'affaires total
    const totalRevenue = this.paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
    this.dashboardStats.totalRevenue = `${totalRevenue.toLocaleString('fr-FR')} FCFA`;

    // Clients actifs (ayant au moins une réservation)
    const clientsWithBookings = new Set(this.voyages.map(v => v.client_id));
    this.dashboardStats.activeCustomers = clientsWithBookings.size;

    // Total destinations
    this.dashboardStats.totalDestinations = this.destinations.length;

    // Moyenne des avis
    if (this.avis.length > 0) {
      const averageRating = this.avis.reduce((sum, avis) => sum + avis.note, 0) / this.avis.length;
      this.dashboardStats.averageRating = Math.round(averageRating * 10) / 10;
    }
    this.dashboardStats.totalReviews = this.avis.length;

    // Réservations en attente et terminées
    this.dashboardStats.pendingBookings = this.voyages.filter(v => v.statut === 'en_attente').length;
    this.dashboardStats.completedBookings = this.voyages.filter(v => v.statut === 'confirme').length;

    // Revenus du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.dashboardStats.monthlyRevenue = this.paiements
      .filter(p => {
        const paiementDate = new Date(p.datePaiement);
        return paiementDate.getMonth() === currentMonth && paiementDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.montant, 0);

    // Nouveaux clients ce mois
    this.dashboardStats.newCustomersThisMonth = this.users
      .filter(u => {
        if (!u.created_at) return false;
        const createdDate = new Date(u.created_at);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;
  }

  generatePopularDestinations(): void {
    const destinationBookings = new Map<number, { count: number, revenue: number }>();

    // Compter les réservations par destination
    this.voyages.forEach(voyage => {
      if (!destinationBookings.has(voyage.destination_id)) {
        destinationBookings.set(voyage.destination_id, { count: 0, revenue: 0 });
      }
      const stats = destinationBookings.get(voyage.destination_id)!;
      stats.count++;
      stats.revenue += voyage.prixTotal || 0;
    });

    // Créer la liste des destinations populaires
    this.popularDestinations = Array.from(destinationBookings.entries())
      .map(([destinationId, stats]) => {
        const destination = this.destinations.find(d => d.id === destinationId);
        return {
          id: destinationId,
          nom: destination?.nom || 'Destination inconnue',
          bookingsCount: stats.count,
          revenue: stats.revenue,
          photo: destination?.photo
        };
      })
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);
  }

  generateRecentBookings(): void {
    this.recentBookings = this.voyages
      .sort((a, b) => new Date(b.date_reservation).getTime() - new Date(a.date_reservation).getTime())
      .slice(0, 10)
      .map(voyage => {
        // Trouver le client via la relation client
        const client = voyage.client;
        const user = client?.user;
        const destination = this.destinations.find(d => d.id === voyage.destination_id);
        
        return {
          id: voyage.id || 0,
          clientName: user ? `${user.prenom} ${user.nom}` : 'Client inconnu',
          destination: destination?.nom || 'Destination inconnue',
          dateReservation: voyage.date_reservation,
          statut: voyage.statut,
          montant: voyage.prixTotal || 0
        };
      });
  }

  generatePaymentMethodsStats(): void {
    const methodCounts = new Map<string, { count: number, total: number }>();
    
    this.paiements.forEach(paiement => {
      if (!methodCounts.has(paiement.methode)) {
        methodCounts.set(paiement.methode, { count: 0, total: 0 });
      }
      const stats = methodCounts.get(paiement.methode)!;
      stats.count++;
      stats.total += paiement.montant;
    });

    this.paymentMethods = Array.from(methodCounts.entries()).map(([method, stats]) => ({
      method,
      count: stats.count,
      total: stats.total,
      percentage: this.paiements.length > 0 ? Math.round((stats.count / this.paiements.length) * 100) : 0
    }));
  }

  generateMonthlyStats(): void {
    const monthlyData = new Map<string, { bookings: number, revenue: number }>();
    
    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(key, { bookings: 0, revenue: 0 });
    }

    // Compter les réservations par mois
    this.voyages.forEach(voyage => {
      const date = new Date(voyage.date_reservation);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        monthlyData.get(key)!.bookings++;
      }
    });

    // Compter les revenus par mois
    this.paiements.forEach(paiement => {
      const date = new Date(paiement.datePaiement);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.has(key)) {
        monthlyData.get(key)!.revenue += paiement.montant;
      }
    });

    this.monthlyStats = Array.from(monthlyData.entries()).map(([key, stats]) => ({
      month: key,
      bookings: stats.bookings,
      revenue: stats.revenue
    }));
  }

  // Méthodes de navigation
  setCurrentSection(section: string): void {
    this.currentSection = section;
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

  refreshData(): void {
    this.loadDashboardData();
  }

  // Méthodes utilitaires
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirme':
        return 'bg-success';
      case 'en_attente':
        return 'bg-warning';
      case 'annule':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirme':
        return 'Confirmé';
      case 'en_attente':
        return 'En attente';
      case 'annule':
        return 'Annulé';
      default:
        return status;
    }
  }

  getProgressPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }
  getMaxBookings(): number {
  return this.monthlyStats.reduce((max, s) => s.bookings > max ? s.bookings : max, 0);
}
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout(); // ← Utilise votre AuthService existant
    }
  }

}
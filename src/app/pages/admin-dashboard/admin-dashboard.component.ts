import { Component } from '@angular/core';

export interface Booking {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  destination: string;
  departureDate: string;
  travelers: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  specialRequests?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: string;
  registrationDate: string;
  status: 'active' | 'inactive';
}

export interface Destination {
  id: number;
  name: string;
  country: string;
  climate: string;
  price: string;
  rating: number;
  totalBookings: number;
  isActive: boolean;
  lastUpdated: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: string;
  activeCustomers: number;
  pendingBookings: number;
  monthlyGrowth: number;
  averageBookingValue: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  currentSection: 'overview' | 'bookings' | 'customers' | 'destinations' | 'settings' = 'overview';
  
  // Filtres et pagination
  bookingFilter = {
    status: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  };

  customerFilter = {
    status: '',
    searchTerm: ''
  };

  destinationFilter = {
    climate: '',
    country: '',
    searchTerm: ''
  };

  currentPage = 1;
  itemsPerPage = 10;

  // Statistiques du dashboard
  dashboardStats: DashboardStats = {
    totalBookings: 1247,
    totalRevenue: '1,847,520FCFA',
    activeCustomers: 892,
    pendingBookings: 23,
    monthlyGrowth: 12.5,
    averageBookingValue: '1,482€'
  };

  // Données fictives pour les réservations
  bookings: Booking[] = [
    {
      id: 1,
      customerName: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+33 6 12 34 56 78',
      destination: 'Bali, Indonésie',
      departureDate: '2025-03-15',
      travelers: 2,
      totalPrice: '2598€',
      status: 'confirmed',
      bookingDate: '2025-01-15',
      specialRequests: 'Chambre avec vue sur mer'
    },
    {
      id: 2,
      customerName: 'Jean Martin',
      email: 'jean.martin@email.com',
      phone: '+33 6 98 76 54 32',
      destination: 'Costa Rica',
      departureDate: '2025-04-20',
      travelers: 4,
      totalPrice: '6396€',
      status: 'pending',
      bookingDate: '2025-01-20',
      specialRequests: 'Régime végétarien'
    },
    {
      id: 3,
      customerName: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 11 22 33 44',
      destination: 'Santorini, Grèce',
      departureDate: '2025-05-10',
      travelers: 1,
      totalPrice: '999€',
      status: 'confirmed',
      bookingDate: '2025-01-18'
    },
    {
      id: 4,
      customerName: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 55 66 77 88',
      destination: 'Bali, Indonésie',
      departureDate: '2025-02-28',
      travelers: 3,
      totalPrice: '3897€',
      status: 'cancelled',
      bookingDate: '2025-01-10'
    }
  ];

  // Données fictives pour les clients
  customers: Customer[] = [
    {
      id: 1,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+33 6 12 34 56 78',
      totalBookings: 3,
      totalSpent: '7,245€',
      registrationDate: '2023-06-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      phone: '+33 6 98 76 54 32',
      totalBookings: 1,
      totalSpent: '6,396€',
      registrationDate: '2024-12-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 11 22 33 44',
      totalBookings: 5,
      totalSpent: '12,890€',
      registrationDate: '2022-03-10',
      status: 'active'
    },
    {
      id: 4,
      name: 'Pierre Durand',
      email: 'pierre.durand@email.com',
      phone: '+33 6 55 66 77 88',
      totalBookings: 2,
      totalSpent: '4,250€',
      registrationDate: '2024-01-05',
      status: 'inactive'
    }
  ];

  // Données fictives pour les destinations
  destinations: Destination[] = [
    {
      id: 1,
      name: 'Bali',
      country: 'Indonésie',
      climate: 'Tropical',
      price: '1299€',
      rating: 4.8,
      totalBookings: 245,
      isActive: true,
      lastUpdated: '2025-01-15'
    },
    {
      id: 2,
      name: 'Costa Rica',
      country: 'Costa Rica',
      climate: 'Tropical',
      price: '1599€',
      rating: 4.9,
      totalBookings: 189,
      isActive: true,
      lastUpdated: '2025-01-10'
    },
    {
      id: 3,
      name: 'Santorini',
      country: 'Grèce',
      climate: 'Méditerranéen',
      price: '999€',
      rating: 4.7,
      totalBookings: 312,
      isActive: true,
      lastUpdated: '2025-01-12'
    },
    {
      id: 4,
      name: 'Tokyo',
      country: 'Japon',
      climate: 'Continental',
      price: '1899€',
      rating: 4.6,
      totalBookings: 156,
      isActive: false,
      lastUpdated: '2024-12-20'
    }
  ];

  constructor() {}

  // Navigation entre sections
  setCurrentSection(section: 'overview' | 'bookings' | 'customers' | 'destinations' | 'settings'): void {
    this.currentSection = section;
    this.currentPage = 1; // Reset pagination
  }

  // Méthodes pour les réservations
  getFilteredBookings(): Booking[] {
    return this.bookings.filter(booking => {
      const matchesStatus = !this.bookingFilter.status || booking.status === this.bookingFilter.status;
      const matchesSearch = !this.bookingFilter.searchTerm || 
        booking.customerName.toLowerCase().includes(this.bookingFilter.searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(this.bookingFilter.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  updateBookingStatus(bookingId: number, newStatus: Booking['status']): void {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = newStatus;
    }
  }

  deleteBooking(bookingId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.bookings = this.bookings.filter(b => b.id !== bookingId);
    }
  }

  // Méthodes pour les clients
  getFilteredCustomers(): Customer[] {
    return this.customers.filter(customer => {
      const matchesStatus = !this.customerFilter.status || customer.status === this.customerFilter.status;
      const matchesSearch = !this.customerFilter.searchTerm || 
        customer.name.toLowerCase().includes(this.customerFilter.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.customerFilter.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  toggleCustomerStatus(customerId: number): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customer.status = customer.status === 'active' ? 'inactive' : 'active';
    }
  }

  // Méthodes pour les destinations
  getFilteredDestinations(): Destination[] {
    return this.destinations.filter(destination => {
      const matchesClimate = !this.destinationFilter.climate || destination.climate === this.destinationFilter.climate;
      const matchesCountry = !this.destinationFilter.country || destination.country === this.destinationFilter.country;
      const matchesSearch = !this.destinationFilter.searchTerm || 
        destination.name.toLowerCase().includes(this.destinationFilter.searchTerm.toLowerCase()) ||
        destination.country.toLowerCase().includes(this.destinationFilter.searchTerm.toLowerCase());
      
      return matchesClimate && matchesCountry && matchesSearch;
    });
  }

  toggleDestinationStatus(destinationId: number): void {
    const destination = this.destinations.find(d => d.id === destinationId);
    if (destination) {
      destination.isActive = !destination.isActive;
      destination.lastUpdated = new Date().toISOString().split('T')[0];
    }
  }

  deleteDestination(destinationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette destination ?')) {
      this.destinations = this.destinations.filter(d => d.id !== destinationId);
    }
  }

  // Méthodes utilitaires
  getStatusBadgeClass(status: string): string {
    const statusClasses = {
      'confirmed': 'bg-success',
      'pending': 'bg-warning text-dark',
      'cancelled': 'bg-danger',
      'completed': 'bg-info',
      'active': 'bg-success',
      'inactive': 'bg-secondary'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const statusTexts = {
      'confirmed': 'Confirmée',
      'pending': 'En attente',
      'cancelled': 'Annulée',
      'completed': 'Terminée',
      'active': 'Actif',
      'inactive': 'Inactif'
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

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
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

  // Méthodes d'export et actions globales
  exportBookings(): void {
    console.log('Export des réservations...', this.getFilteredBookings());
    alert('Export en cours... (voir console)');
  }

  exportCustomers(): void {
    console.log('Export des clients...', this.getFilteredCustomers());
    alert('Export en cours... (voir console)');
  }

  sendNotification(type: 'booking' | 'customer', id: number): void {
    console.log(`Notification envoyée pour ${type} ID: ${id}`);
    alert(`Notification envoyée avec succès !`);
  }

  // Données pour les graphiques (fictives)
  getMonthlyBookingsData(): any[] {
    return [
      { month: 'Jan', bookings: 45, revenue: 67500 },
      { month: 'Fév', bookings: 52, revenue: 78000 },
      { month: 'Mar', bookings: 48, revenue: 72000 },
      { month: 'Avr', bookings: 61, revenue: 91500 },
      { month: 'Mai', bookings: 57, revenue: 85500 },
      { month: 'Jun', bookings: 69, revenue: 103500 }
    ];
  }

  getTopDestinations(): any[] {
    return this.destinations
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 5);
  }

  // Actions d'administration
  clearFilters(): void {
    this.bookingFilter = { status: '', dateFrom: '', dateTo: '', searchTerm: '' };
    this.customerFilter = { status: '', searchTerm: '' };
    this.destinationFilter = { climate: '', country: '', searchTerm: '' };
  }

  refreshData(): void {
    // Ici vous appelleriez vos services pour recharger les données
    console.log('Rechargement des données...');
    alert('Données rechargées avec succès !');
  }
}
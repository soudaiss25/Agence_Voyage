import { Component } from '@angular/core';

export interface TravelPreferences {
  climate: string;
  zone: string;
  language: string;
  budget: string;
  duration: string;
  activities: string[];
}

export interface TravelRecommendation {
  id: number;
  destination: string;
  climate: string;
  zone: string;
  language: string;
  price: string;
  duration: string;
  rating: number;
  image_placeholder: string;
  description: string;
  highlights: string[];
}

export interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  travelers: number;
  departureDate: string;
  specialRequests: string;
}

@Component({
  selector: 'app-travel-booking-system',
  templateUrl: './travel-booking-system.component.html',
  styleUrl: './travel-booking-system.component.css'
})
export class TravelBookingSystemComponent {
  currentPage: 'preferences' | 'recommendations' | 'validation' = 'preferences';
  
  preferences: TravelPreferences = {
    climate: '',
    zone: '',
    language: '',
    budget: '',
    duration: '',
    activities: []
  };

  bookingData: BookingData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    travelers: 1,
    departureDate: '',
    specialRequests: ''
  };

  selectedTrip: TravelRecommendation | null = null;

  // Options pour les formulaires
  climateOptions = ['Tropical', 'Méditerranéen', 'Continental', 'Montagnard'];
  zoneOptions = ['Europe', 'Asie', 'Amérique', 'Afrique', 'Océanie'];
  languageOptions = [
    { value: 'francais', label: 'Français' },
    { value: 'anglais', label: 'Anglais' },
    { value: 'espagnol', label: 'Espagnol' },
    { value: 'local', label: 'Langue locale' }
  ];
  budgetOptions = [
    { value: 'economique', label: 'Économique (500-1000€)' },
    { value: 'moyen', label: 'Moyen (1000-2000€)' },
    { value: 'premium', label: 'Premium (2000€+)' }
  ];
  durationOptions = ['3-5 jours', '1 semaine', '2 semaines', '1 mois+'];
  activityOptions = ['Plage', 'Culture', 'Aventure', 'Gastronomie', 'Nature', 'Shopping'];
  travelerOptions = [1, 2, 3, 4, 5, 6];

  // Données fictives pour les recommandations
  recommendations: TravelRecommendation[] = [
    {
      id: 1,
      destination: "Bali, Indonésie",
      climate: "Tropical",
      zone: "Asie du Sud-Est",
      language: "Anglais/Local",
      price: "1299€",
      duration: "7 jours",
      rating: 4.8,
      image_placeholder: "🏝️",
      description: "Découvrez les temples mystiques et les plages paradisiaques de Bali",
      highlights: ["Temples authentiques", "Plages de rêve", "Culture riche", "Cuisine locale"]
    },
    {
      id: 2,
      destination: "Costa Rica",
      climate: "Tropical",
      zone: "Amérique Centrale",
      language: "Espagnol",
      price: "1599€",
      duration: "10 jours",
      rating: 4.9,
      image_placeholder: "🌴",
      description: "Aventure écologique dans la biodiversité du Costa Rica",
      highlights: ["Faune exceptionnelle", "Forêts tropicales", "Volcans actifs", "Écotourisme"]
    },
    {
      id: 3,
      destination: "Santorini, Grèce",
      climate: "Méditerranéen",
      zone: "Europe du Sud",
      language: "Grec/Anglais",
      price: "999 FCFA",
      duration: "5 jours",
      rating: 4.7,
      image_placeholder: "🏛️",
      description: "Romance et couchers de soleil inoubliables en mer Égée",
      highlights: ["Couchers de soleil", "Architecture cyclades", "Vins locaux", "Plages volcaniques"]
    }
  ];

  constructor() {}

  // Méthodes pour la navigation
  goToRecommendations(): void {
    this.currentPage = 'recommendations';
  }

  goToValidation(trip: TravelRecommendation): void {
    this.selectedTrip = trip;
    this.currentPage = 'validation';
  }

  goToPreferences(): void {
    this.currentPage = 'preferences';
  }

  // Méthodes pour la gestion des préférences
  onClimateChange(climate: string): void {
    this.preferences.climate = climate;
  }

  onZoneChange(zone: string): void {
    this.preferences.zone = zone;
  }

  onLanguageChange(language: string): void {
    this.preferences.language = language;
  }

  onBudgetChange(budget: string): void {
    this.preferences.budget = budget;
  }

  onDurationChange(duration: string): void {
    this.preferences.duration = duration;
  }

  onActivityToggle(activity: string): void {
    const index = this.preferences.activities.indexOf(activity);
    if (index > -1) {
      this.preferences.activities.splice(index, 1);
    } else {
      this.preferences.activities.push(activity);
    }
  }

  isActivitySelected(activity: string): boolean {
    return this.preferences.activities.includes(activity);
  }

  // Méthodes pour la gestion du booking
  onBookingDataChange<K extends keyof BookingData>(field: K, value: BookingData[K]): void {
  this.bookingData[field] = value;
}

  // Méthodes utilitaires
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  calculateTotalPrice(): string {
    if (!this.selectedTrip) return '0FCFA';
    const basePrice = parseInt(this.selectedTrip.price.replace('FCFA', ''));
    const totalPrice = basePrice * this.bookingData.travelers;
    return `${totalPrice}FCFA`;
  }

  // Méthode de soumission finale
  onSubmitBooking(): void {
    console.log('Booking Data:', this.bookingData);
    console.log('Selected Trip:', this.selectedTrip);
    console.log('Preferences:', this.preferences);
    
    // Ici vous pouvez ajouter l'appel à votre service de réservation
    alert('Réservation soumise avec succès ! (voir console pour les détails)');
  }

  // Méthode pour ajouter aux favoris
  addToFavorites(trip: TravelRecommendation): void {
    console.log('Ajouté aux favoris:', trip);
    alert(`${trip.destination} ajouté aux favoris !`);
  }

  // Validation du formulaire
  isBookingFormValid(): boolean {
    return !!(
      this.bookingData.firstName &&
      this.bookingData.lastName &&
      this.bookingData.email &&
      this.bookingData.phone &&
      this.bookingData.departureDate
    );
  }

  // Méthode pour obtenir les classes CSS dynamiques
  getCardClass(isSelected: boolean = false): string {
    let baseClass = 'card h-100 shadow-lg border-0';
    if (isSelected) {
      baseClass += ' border-primary border-3';
    }
    return baseClass;
  }

  // Méthode pour formater les dates
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
// src/app/components/booking/booking.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VoyageService, CreateVoyageRequest } from '../../services/voyage.service';
import { AuthService } from '../../services/auth.service';
import { TravelRecommendation } from '../../models/preference-client.inteface';
import { User } from '../../models/user.inteface';
import { PaiementService } from '../../services/paiement.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Router } from '@angular/router';

// 🔹 Déclarer Stripe pour TypeScript
declare var Stripe: any;

export interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  travelers: number;
  departureDate: string;
  returnDate: string;
  specialRequests: string;
  typeHebergement: string;
}

@Component({
  selector: 'app-booking',
   standalone : true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule],
  
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  @Input() selectedTrip: TravelRecommendation | null = null;
  @Output() goToRecommendations = new EventEmitter<void>();
  @Output() bookingCompleted = new EventEmitter<void>();
  
  minDate: string = '';
  bookingData: BookingData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    travelers: 1,
    departureDate: '',
    returnDate: '',
    specialRequests: '',
    typeHebergement: 'Standard'
  };

  currentUser: User | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isBookingSubmitted = false;
  showPaymentOptions = false;
  selectedPaymentMethod: 'stripe' | 'wave' | null = null;
  voyageId: number | null = null;

  // 🔹 Variables Stripe
  showStripeForm = false;
  stripe: any;
  stripeElements: any;
  cardElement: any;
  clientSecret = '';
  isProcessingPayment = false;

  travelerOptions = [1, 2, 3, 4, 5, 6];
  hebergementOptions = [
    { value: 'Standard', label: 'Standard' },
    { value: 'Supérieur', label: 'Supérieur' },
    { value: 'Luxe', label: 'Luxe' },
    { value: 'Suite', label: 'Suite' }
  ];

  constructor(
  private voyageService: VoyageService,
  private authService: AuthService,
  private paiementService: PaiementService,
  private router: Router
) {
  const nav = this.router.getCurrentNavigation();
  if (nav?.extras.state && nav.extras.state['selectedTrip']) {
    this.selectedTrip = nav.extras.state['selectedTrip'];
  }
}


  ngOnInit(): void {
    console.log('[BookingComponent] Initialisation avec voyage sélectionné:', this.selectedTrip);
    this.loadCurrentUser();
    this.initializeDates();
    this.minDate = new Date().toISOString().split('T')[0];
    this.initializeStripe(); // 🔹 Initialiser Stripe
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔹 Initialiser Stripe
  private initializeStripe(): void {
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe('pk_test_votre_clé_publique_stripe'); // 🔹 Remplacez par votre clé publique
      this.stripeElements = this.stripe.elements();
    }
  }

  // 🔹 Créer les éléments Stripe
  private setupStripeElements(): void {
    if (!this.stripe || !this.stripeElements) return;

    // Créer l'élément carte
    this.cardElement = this.stripeElements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    });

    // Monter l'élément dans le DOM
    setTimeout(() => {
      const cardElementContainer = document.getElementById('card-element');
      if (cardElementContainer && this.cardElement) {
        this.cardElement.mount('#card-element');
      }
    }, 100);
  }

  // Charger les informations de l'utilisateur connecté
  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('[BookingComponent] Utilisateur chargé:', user);
          this.currentUser = user;
          this.prefillUserData(user);
        }
      });
  }

  // Pré-remplir les données utilisateur
  private prefillUserData(user: User): void {
    this.bookingData.firstName = user.prenom || '';
    this.bookingData.lastName = user.nom || '';
    this.bookingData.email = user.email || '';
    this.bookingData.phone = user.telephone || '';
    
    console.log('[BookingComponent] Données utilisateur pré-remplies:', this.bookingData);
  }

  // Initialiser les dates par défaut
  private initializeDates(): void {
    if (this.selectedTrip) {
      const today = new Date();
      const defaultDeparture = new Date(today);
      defaultDeparture.setDate(today.getDate() + 7);
      this.bookingData.departureDate = defaultDeparture.toISOString().split('T')[0];
      
      this.calculateReturnDate();
    }
  }

  // Calculer automatiquement la date de retour
  calculateReturnDate(): void {
    if (this.bookingData.departureDate && this.selectedTrip) {
      const duration = this.extractDurationDays(this.selectedTrip.duration);
      const returnDate = this.voyageService.calculateReturnDate(this.bookingData.departureDate, duration);
      this.bookingData.returnDate = returnDate;
      console.log('[BookingComponent] Date de retour calculée:', returnDate);
    }
  }

  private extractDurationDays(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 7;
  }

  onDepartureDateChange(): void {
    if (this.bookingData.departureDate) {
      this.calculateReturnDate();
      this.clearMessages();
    }
  }

  onTravelersChange(): void {
    this.clearMessages();
  }

  onBookingDataChange<K extends keyof BookingData>(field: K, value: BookingData[K]): void {
    this.bookingData[field] = value;
    this.clearMessages();
    
    if (field === 'departureDate') {
      this.calculateReturnDate();
    }
    
    console.log('[BookingComponent] Donnée modifiée:', field, value);
  }

  onGoToRecommendations(): void {
    this.goToRecommendations.emit();
  }

  // Soumettre la réservation
  onSubmitBooking(): void {
    if (!this.isBookingFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (!this.selectedTrip) {
      this.errorMessage = 'Aucun voyage sélectionné';
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'Vous devez être connecté pour effectuer une réservation';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const voyageRequest: CreateVoyageRequest = {
      prixTotal: this.calculateTotalPriceNumeric(),
      destination_id: this.selectedTrip.id,
      dateDepart: this.bookingData.departureDate,
      dateRetour: this.bookingData.returnDate,
      nombrePlaceReservee: this.bookingData.travelers,
      typeHebergement: this.bookingData.typeHebergement,
      date_reservation: new Date().toISOString().split('T')[0],
      statut: 'En attente'
    };

    console.log('[BookingComponent] Envoi de la réservation:', voyageRequest);

    this.voyageService.createVoyage(voyageRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[BookingComponent] Réservation créée:', response);
          this.isLoading = false;
          this.voyageId = response.voyage.id!;
          
          this.successMessage = `Réservation créée ! Veuillez procéder au paiement.`;
          this.showPaymentOptions = true;
          this.isBookingSubmitted = true;
        },
        error: (error) => {
          console.error('[BookingComponent] Erreur lors de la réservation:', error);
          this.isLoading = false;
          
          if (error.status === 422) {
            this.errorMessage = 'Données de réservation invalides. Veuillez vérifier vos informations.';
          } else if (error.status === 401) {
            this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          } else {
            this.errorMessage = error.error?.message || 'Erreur lors de la réservation. Veuillez réessayer.';
          }
        }
      });
  }

  // Méthodes utilitaires
  calculateTotalPrice(): string {
    if (!this.selectedTrip) return '0 FCFA';
    
    const basePrice = this.extractPriceFromString(this.selectedTrip.price);
    const totalPrice = this.voyageService.calculateTotalPrice(basePrice, this.bookingData.travelers);
    
    return this.formatPrice(totalPrice);
  }

  private calculateTotalPriceNumeric(): number {
    if (!this.selectedTrip) return 0;
    
    const basePrice = this.extractPriceFromString(this.selectedTrip.price);
    return this.voyageService.calculateTotalPrice(basePrice, this.bookingData.travelers);
  }

  private extractPriceFromString(priceString: string): number {
    const match = priceString.replace(/[^\d]/g, '');
    return parseInt(match) || 0;
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  isBookingFormValid(): boolean {
    const isValid = !!(
      this.bookingData.firstName &&
      this.bookingData.lastName &&
      this.bookingData.email &&
      this.bookingData.phone &&
      this.bookingData.departureDate &&
      this.bookingData.returnDate &&
      this.bookingData.travelers > 0 &&
      this.bookingData.typeHebergement
    );

    if (isValid && this.bookingData.departureDate && this.bookingData.returnDate) {
      const departure = new Date(this.bookingData.departureDate);
      const returnDate = new Date(this.bookingData.returnDate);
      return returnDate > departure;
    }

    return isValid;
  }

  isValidDepartureDate(): boolean {
    if (!this.bookingData.departureDate) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departure = new Date(this.bookingData.departureDate);
    
    return departure >= today;
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getTripDuration(): number {
    if (!this.bookingData.departureDate || !this.bookingData.returnDate) return 0;
    
    const departure = new Date(this.bookingData.departureDate);
    const returnDate = new Date(this.bookingData.returnDate);
    const diffTime = returnDate.getTime() - departure.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  // 🔹 Sélectionner la méthode de paiement
  selectPaymentMethod(method: 'stripe' | 'wave'): void {
    this.selectedPaymentMethod = method;
    
    if (method === 'stripe') {
      this.initializeStripePayment();
    } else {
      this.proceedToWavePayment();
    }
  }

  // 🔹 Initialiser le paiement Stripe
  private initializeStripePayment(): void {
    if (!this.voyageId) {
      this.errorMessage = 'Erreur de paiement. Veuillez réessayer.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const montant = this.calculateTotalPriceNumeric();

    this.paiementService.createPaiement(this.voyageId, montant, 'stripe')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[BookingComponent] Paiement Stripe initié:', response);
          this.isLoading = false;

          if (response.clientSecret) {
            this.clientSecret = response.clientSecret;
            this.showStripeForm = true;
            this.showPaymentOptions = false;
            
            // Configurer les éléments Stripe après affichage du formulaire
            setTimeout(() => {
              this.setupStripeElements();
            }, 100);
          }
        },
        error: (error) => {
          console.error('[BookingComponent] Erreur paiement Stripe:', error);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de l\'initialisation du paiement Stripe.';
        }
      });
  }

  // 🔹 Traiter le paiement Stripe
  async processStripePayment(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.clientSecret) {
      this.errorMessage = 'Erreur d\'initialisation Stripe.';
      return;
    }

    this.isProcessingPayment = true;
    this.clearMessages();

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: `${this.bookingData.firstName} ${this.bookingData.lastName}`,
            email: this.bookingData.email,
          },
        }
      });

      this.isProcessingPayment = false;

      if (error) {
        console.error('[Stripe] Erreur de paiement:', error);
        this.errorMessage = error.message || 'Erreur lors du paiement.';
      } else if (paymentIntent.status === 'succeeded') {
        console.log('[Stripe] Paiement réussi:', paymentIntent);
        this.successMessage = 'Paiement réussi ! Votre réservation est confirmée.';
        this.showStripeForm = false;
        this.bookingCompleted.emit();
      }
    } catch (err) {
      this.isProcessingPayment = false;
      console.error('[Stripe] Erreur inattendue:', err);
      this.errorMessage = 'Erreur inattendue lors du paiement.';
    }
  }

  // 🔹 Traiter le paiement Wave
  private proceedToWavePayment(): void {
    if (!this.voyageId) {
      this.errorMessage = 'Erreur de paiement. Veuillez réessayer.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const montant = this.calculateTotalPriceNumeric();

    this.paiementService.createPaiement(this.voyageId, montant, 'wave')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[BookingComponent] Paiement Wave initié:', response);
          this.isLoading = false;

          if (response.url) {
            window.open(response.url, '_blank');
            this.successMessage = 'Vous avez été redirigé vers la page de paiement Wave.';
          }
        },
        error: (error) => {
          console.error('[BookingComponent] Erreur paiement Wave:', error);
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de l\'initialisation du paiement Wave.';
        }
      });
  }

  // 🔹 Annuler le paiement
  cancelPayment(): void {
    this.showPaymentOptions = false;
    this.showStripeForm = false;
    this.selectedPaymentMethod = null;
    this.successMessage = '';
    this.showPaymentOptions = true; // Revenir aux options de paiement
  }

  // 🔹 Retourner aux options de paiement depuis Stripe
  backToPaymentOptions(): void {
    this.showStripeForm = false;
    this.showPaymentOptions = true;
    this.selectedPaymentMethod = null;
    if (this.cardElement) {
      this.cardElement.unmount();
    }
  }
}
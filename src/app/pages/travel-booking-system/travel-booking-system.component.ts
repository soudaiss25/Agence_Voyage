// src/app/components/travel-booking-system/travel-booking-system.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { RecommendationService } from '../../services/recommendation.service';
import { AuthService } from '../../services/auth.service';
import { PreferenceClient, TravelRecommendation, TypeVoyage } from '../../models/preference-client.inteface';
import { Destination } from '../../models/destination.inteface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookingComponent } from '../booking/booking.component';


@Component({
  selector: 'app-travel-booking-system',
  standalone : true,
  imports:[CommonModule,FormsModule,ReactiveFormsModule,BookingComponent],
  templateUrl: './travel-booking-system.component.html',
  
  styleUrl: './travel-booking-system.component.css'
})
export class TravelBookingSystemComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentPage: 'preferences' | 'recommendations' | 'booking' = 'preferences';
  selectedTrip: TravelRecommendation | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  isComponentInitialized = false;
  isAuthReady = false;

  preferences: PreferenceClient = {
    climat: '',
    budget: '',
    typeVoyage_id: 0,
    langueParlee: '',
    activite: ''
  };

  // Options pour les formulaires
  climatOptions = ['Tropical', 'Méditerranéen', 'Continental', 'Montagnard', 'Désertique', 'Polaire'];
  
  typesVoyage: TypeVoyage[] = [];
  
  languageOptions = [
    { value: 'Français', label: 'Français' },
    { value: 'Anglais', label: 'Anglais' },
    { value: 'Espagnol', label: 'Espagnol' },
    { value: 'Arabe', label: 'Arabe' },
    { value: 'Chinois', label: 'Chinois' },
    { value: 'Local', label: 'Langue locale' }
  ];
  
  budgetOptions = [
    { value: 'Économique', label: 'Économique (≤ 500 000 FCFA)' },
    { value: 'Moyen', label: 'Moyen (500 000 – 1 000 000 FCFA)' },
    { value: 'Premium', label: 'Premium (1 000 000 – 2 000 000 FCFA)' },
    { value: 'Luxe', label: 'Luxe (≥ 2 000 000 FCFA)' }
  ];
  
  activiteOptions = ['Plage', 'Culture', 'Aventure', 'Gastronomie', 'Nature', 'Shopping', 'Sport', 'Détente', 'Histoire'];

  recommendations: TravelRecommendation[] = [];
  destinations: Destination[] = [];

  constructor(
    private recommendationService: RecommendationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('[TravelBookingComponent] Initialisation du composant');
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    console.log('[TravelBookingComponent] Destruction du composant');
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ CORRIGÉ: Initialisation avec gestion d'erreur appropriée
  private initializeComponent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('[TravelBookingComponent] Attente de l\'initialisation de l\'authentification...');

    this.authService.waitForInitialization()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isInitialized) => {
          if (isInitialized) {
            console.log('[TravelBookingComponent] Authentification initialisée');
            this.isAuthReady = true;
            
            if (this.authService.isAuthenticated()) {
              console.log('[TravelBookingComponent] Utilisateur authentifié, chargement des données');
              this.loadComponentData();
            } else {
              console.warn('[TravelBookingComponent] Utilisateur non authentifié');
              this.handleUnauthenticatedState();
            }
          }
        },
        error: (error) => {
          console.error('[TravelBookingComponent] Erreur lors de l\'initialisation:', error);
          this.handleInitializationError(error);
        }
      });
  }

  // ✅ CORRIGÉ: Chargement des données avec gestion appropriée des erreurs 404
  private loadComponentData(): void {
    console.log('[TravelBookingComponent] Début du chargement des données');
    
    // D'abord charger les types de voyage (nécessaire pour le formulaire)
    this.loadTypesVoyage();
    
    // Ensuite essayer de charger les préférences existantes (optionnel)
    this.loadExistingPreferencesQuietly();
    
    this.isComponentInitialized = true;
    this.isLoading = false; // ✅ AJOUTÉ: Arrêter le loading ici
    console.log('[TravelBookingComponent] Composant initialisé avec succès');
  }

  private handleUnauthenticatedState(): void {
    console.warn('[TravelBookingComponent] Gestion de l\'état non authentifié');
    this.isLoading = false;
    this.errorMessage = 'Vous devez être connecté pour accéder à cette fonctionnalité';
  }

  private handleInitializationError(error: any): void {
    console.error('[TravelBookingComponent] Erreur d\'initialisation:', error);
    this.isLoading = false;
    this.errorMessage = 'Erreur lors de l\'initialisation. Veuillez rafraîchir la page.';
  }

  // ✅ CORRIGÉ: Chargement des types de voyage avec gestion d'erreur
  loadTypesVoyage(): void {
    if (!this.isAuthReady) {
      console.warn('[TravelBookingComponent] Auth pas prête pour charger les types de voyage');
      return;
    }

    this.recommendationService.getTypesVoyage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.typesVoyage = types;
          console.log('[TravelBookingComponent] Types de voyage chargés:', types.length);
        },
        error: (error) => {
          console.error('[TravelBookingComponent] Erreur lors du chargement des types de voyage:', error);
          // Ne pas bloquer l'interface pour cette erreur
          this.typesVoyage = [];
        }
      });
  }

  // ✅ NOUVEAU: Version silencieuse du chargement des préférences
  private loadExistingPreferencesQuietly(): void {
    if (!this.isAuthReady) {
      console.warn('[TravelBookingComponent] Auth pas prête pour charger les préférences');
      return;
    }

    this.recommendationService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          if (preferences) {
            this.preferences = preferences;
            console.log('[TravelBookingComponent] Préférences existantes chargées:', preferences);
            this.successMessage = 'Vos préférences sauvegardées ont été chargées';
          }
        },
        error: (error) => {
          if (error.status === 404) {
            // C'est normal, l'utilisateur n'a pas encore de préférences
            console.log('[TravelBookingComponent] Aucune préférence existante trouvée (normal pour un nouvel utilisateur)');
          } else {
            console.warn('[TravelBookingComponent] Erreur lors du chargement des préférences:', error);
          }
          // Ne pas afficher d'erreur à l'utilisateur dans ce cas
        }
      });
  }

  // ✅ CORRIGÉ: Version publique si nécessaire
  loadExistingPreferences(): void {
    if (!this.canPerformAction()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.recommendationService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preferences) => {
          if (preferences) {
            this.preferences = preferences;
            console.log('[TravelBookingComponent] Préférences chargées:', preferences);
            this.successMessage = 'Préférences chargées avec succès';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 404) {
            this.errorMessage = 'Aucune préférence trouvée. Veuillez d\'abord saisir vos préférences.';
          } else {
            this.handleServiceError(error, 'Erreur lors du chargement des préférences');
          }
        }
      });
  }

  private handleServiceError(error: any, defaultMessage: string): void {
    this.isLoading = false;
    
    if (error.status === 401) {
      this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.error && error.error.message) {
      this.errorMessage = error.error.message;
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = defaultMessage;
    }
  }

  private canPerformAction(): boolean {
    if (!this.isAuthReady) {
      this.errorMessage = 'Authentification en cours, veuillez patienter...';
      return false;
    }

    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Vous devez être connecté pour effectuer cette action';
      return false;
    }

    return true;
  }

  // Navigation
  goToRecommendations(): void {
    this.currentPage = 'recommendations';
    this.selectedTrip = null;
    this.clearMessages();
  }

  goToPreferences(): void {
    this.currentPage = 'preferences';
    this.clearMessages();
  }

  // ✅ CORRIGÉ: Validation des préférences améliorée
  validatePreferences(): boolean {
    this.errorMessage = '';
    
    const missingFields = [];
    
    if (!this.preferences.climat || this.preferences.climat.trim() === '') {
      missingFields.push('Climat');
    }
    if (!this.preferences.budget || this.preferences.budget.trim() === '') {
      missingFields.push('Budget');
    }
    if (!this.preferences.typeVoyage_id || this.preferences.typeVoyage_id === 0) {
      missingFields.push('Type de voyage');
    }
    if (!this.preferences.langueParlee || this.preferences.langueParlee.trim() === '') {
      missingFields.push('Langue parlée');
    }
    if (!this.preferences.activite || this.preferences.activite.trim() === '') {
      missingFields.push('Activité');
    }

    if (missingFields.length > 0) {
      this.errorMessage = `Veuillez remplir les champs suivants : ${missingFields.join(', ')}`;
      return false;
    }

    console.log('[TravelBookingComponent] Validation réussie, préférences:', this.preferences);
    return true;
  }

  // ✅ CORRIGÉ: Sauvegarder et générer avec validation et logs détaillés
  saveAndGenerateRecommendations(): void {
    if (!this.canPerformAction()) {
      return;
    }

    if (!this.validatePreferences()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    console.log('[TravelBookingComponent] Début sauvegarde des préférences:', this.preferences);
    console.log('[TravelBookingComponent] Données à envoyer:', JSON.stringify(this.preferences, null, 2));

    this.recommendationService.savePreferences(this.preferences)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TravelBookingComponent] Préférences sauvegardées avec succès:', response);
          console.log('[TravelBookingComponent] Réponse complète:', JSON.stringify(response, null, 2));
          
          // Vérifier si les préférences sont bien dans la réponse
          if (response && response.preferences) {
            console.log('[TravelBookingComponent] ID des préférences sauvegardées:', response.preferences.id);
            this.preferences = response.preferences; // Mettre à jour avec les données du serveur
          }
          
          this.successMessage = 'Préférences sauvegardées avec succès';
          
          // Attendre un peu puis générer les recommandations
          setTimeout(() => {
            console.log('[TravelBookingComponent] Démarrage génération des recommandations...');
            this.generateRecommendations();
          }, 1000); // Augmenté le délai
        },
        error: (error) => {
          console.error('[TravelBookingComponent] ERREUR lors de la sauvegarde des préférences:', error);
          console.error('[TravelBookingComponent] Détails de l\'erreur:', JSON.stringify(error, null, 2));
          console.error('[TravelBookingComponent] Status HTTP:', error.status);
          console.error('[TravelBookingComponent] Message d\'erreur:', error.error?.message);
          
          this.handleServiceError(error, 'Erreur lors de la sauvegarde des préférences');
        }
      });
  }

  // ✅ CORRIGÉ: Génération des recommandations avec gestion d'erreur améliorée
  generateRecommendations(): void {
    console.log('[TravelBookingComponent] Début génération des recommandations');
    
    this.recommendationService.generateRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TravelBookingComponent] Réponse complète du backend:', response);
          
          if (response && response.recommandations && Array.isArray(response.recommandations)) {
            this.processRecommendations(response.recommandations);
            this.currentPage = 'recommendations';
            this.successMessage = response.message || 'Recommandations générées avec succès';
          } else {
            console.warn('[TravelBookingComponent] Aucune recommandation dans la réponse:', response);
            this.errorMessage = 'Aucune recommandation trouvée pour vos critères';
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[TravelBookingComponent] Erreur lors de la génération des recommandations:', error);
          this.isLoading = false;
          
          if (error.status === 404) {
            this.errorMessage = 'Aucune préférence trouvée. Veuillez d\'abord saisir vos préférences.';
          } else if (error.status === 422) {
            this.errorMessage = 'Les préférences ne sont pas valides. Veuillez vérifier vos données.';
          } else {
            this.handleServiceError(error, 'Erreur lors de la génération des recommandations');
          }
        }
      });
  }

  // ✅ INCHANGÉ: Traitement des recommandations
  processRecommendations(backendRecommandations: any[]): void {
    console.log('[TravelBookingComponent] Traitement des recommandations:', backendRecommandations);
    
    if (!Array.isArray(backendRecommandations) || backendRecommandations.length === 0) {
      console.warn('[TravelBookingComponent] Aucune recommandation à traiter');
      this.recommendations = [];
      return;
    }

    this.recommendations = backendRecommandations
      .map((rec) => {
        const destination = rec.destination;
        
        if (!destination) {
          console.warn('[TravelBookingComponent] Destination manquante dans la recommandation:', rec);
          return null;
        }

        return {
          id: destination.id,
          destination: destination.nom || 'Destination inconnue',
          climat: destination.climat || 'Non spécifié',
          pays: destination.pays || 'Non spécifié',
          language: destination.langueLocale || 'Non spécifié',
          price: destination.prix ? this.formatPrice(destination.prix) : 'Prix non disponible',
          duration: this.getDurationFromType(destination.typeVoyage?.nom || ''),
          rating: this.generateRating(),
          image_placeholder: this.getImagePlaceholder(destination.climat || ''),
          image: this.getPhotoUrl(destination.photo || ''), 
          description: destination.description || 'Description non disponible',
          highlights: Array.isArray(destination.activites) ? destination.activites.slice(0, 4) : [],
          activites: Array.isArray(destination.activites) ? destination.activites : [],
          score: rec.score || 0,
          matchPercentage: rec.score ? Math.round((rec.score / 14) * 100) : 0
        } as TravelRecommendation;
      })
      .filter((rec): rec is TravelRecommendation => rec !== null);

    this.recommendations.sort((a, b) => (b as any).score - (a as any).score);
    
    console.log('[TravelBookingComponent] Recommandations traitées:', this.recommendations.length);
  }

  addToFavorites(trip: TravelRecommendation): void {
    if (!this.canPerformAction()) {
      return;
    }

    this.recommendationService.addToFavorites(trip.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[TravelBookingComponent] Ajouté aux favoris:', response);
          alert(`${trip.destination} ajouté aux favoris !`);
        },
        error: (error) => {
          console.error('[TravelBookingComponent] Erreur lors de l\'ajout aux favoris:', error);
          this.handleServiceError(error, 'Erreur lors de l\'ajout aux favoris');
        }
      });
  }

  get isReady(): boolean {
    return this.isAuthReady && this.isComponentInitialized;
  }

  // Méthodes utilitaires
  getBudgetDisplay(budget: string): string {
    const budgetMap: { [key: string]: string } = {
      'Économique': '≤ 500 000 FCFA',
      'Moyen': '500 000 – 1 000 000 FCFA',
      'Premium': '1 000 000 – 2 000 000 FCFA',
      'Luxe': '≥ 2 000 000 FCFA'
    };
    return budgetMap[budget] || 'Non défini';
  }

  getDurationFromType(typeName: string): string {
    const durationMap: { [key: string]: string } = {
      'Court séjour': '3-5 jours',
      'Semaine': '7 jours',
      'Deux semaines': '14 jours',
      'Long séjour': '21+ jours'
    };
    return durationMap[typeName] || '7 jours';
  }

  generateRating(): number {
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
  }

  getImagePlaceholder(climat: string): string {
    const placeholders: { [key: string]: string } = {
      'Tropical': '🏝️',
      'Méditerranéen': '🏛️',
      'Continental': '🏔️',
      'Montagnard': '⛰️',
      'Désertique': '🐪',
      'Polaire': '🐧'
    };
    return placeholders[climat] || '🌍';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' FCFA';
  }

  getPhotoUrl(path: string): string {
    if (!path) {
      return 'assets/images/default-placeholder.jpg';
    }
    return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
  }

  // Gestion des événements
  onClimatChange(climat: string): void {
    this.preferences.climat = climat;
    console.log('[TravelBookingComponent] Climat sélectionné:', climat);
  }

  onTypeVoyageChange(event: any): void {
    const typeId = parseInt(event.target.value);
    this.preferences.typeVoyage_id = typeId;
    console.log('[TravelBookingComponent] Type de voyage sélectionné:', typeId);
  }

  onLanguageChange(event: any): void {
    this.preferences.langueParlee = event.target.value;
    console.log('[TravelBookingComponent] Langue sélectionnée:', this.preferences.langueParlee);
  }

  onBudgetChange(event: any): void {
    this.preferences.budget = event.target.value;
    console.log('[TravelBookingComponent] Budget sélectionné:', this.preferences.budget);
  }

  onActiviteChange(activite: string): void {
    this.preferences.activite = activite;
    console.log('[TravelBookingComponent] Activité sélectionnée:', activite);
  }

  // Méthodes utilitaires pour l'affichage
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getCardClass(isSelected: boolean = false): string {
    let baseClass = 'card h-100 shadow-lg border-0';
    if (isSelected) {
      baseClass += ' border-primary border-3';
    }
    return baseClass;
  }

  getSelectedTypeVoyageName(): string {
    const type = this.typesVoyage.find(t => t.id === this.preferences.typeVoyage_id);
    return type ? type.libelle : '';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Gestion de la sélection de voyage
  selectTrip(trip: TravelRecommendation): void {
    console.log('[TravelBookingComponent] Voyage sélectionné:', trip);
    this.selectedTrip = trip;
    this.currentPage = 'booking';
  }

  onBookingCompleted(): void {
    console.log('[TravelBookingComponent] Réservation terminée');
    this.selectedTrip = null;
    this.currentPage = 'preferences';
    this.recommendations = [];
    this.successMessage = 'Réservation effectuée avec succès !';
  }
}
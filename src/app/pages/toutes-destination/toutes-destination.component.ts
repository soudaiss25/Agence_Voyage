// src/app/components/toutes-destination/toutes-destination.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { AuthService } from '../../services/auth.service';
import { Destination } from '../../models/destination.inteface';
import { User } from '../../models/user.inteface';
import { TravelRecommendation } from '../../models/preference-client.inteface';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-toutes-destination',
  standalone : true,
    imports:[CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './toutes-destination.component.html',
  styleUrl: './toutes-destination.component.css'
})
export class ToutesDestinationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  currentUser: User | null = null;
  selectedTrip: TravelRecommendation | null = null;
   currentPageNav: 'toutDestination' | 'booking' = 'toutDestination';
  // Filtres
  filters = {
    search: '',
    pays: '',
    prixMin: null as number | null,
    prixMax: null as number | null
  };
  
  // Options pour les filtres
  paysOptions: string[] = [];
  
  // États du composant
  isLoading = false;
  errorMessage = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  constructor(
    private destinationService: DestinationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[ToutesDestinationComponent] Initialisation');
    this.loadCurrentUser();
    this.loadDestinations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Charger l'utilisateur actuel
  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        console.log('[ToutesDestinationComponent] Utilisateur chargé:', user?.nom);
      });
  }

  // Charger toutes les destinations
  private loadDestinations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.destinationService.getDestinations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destinations) => {
          console.log('[ToutesDestinationComponent] Destinations chargées:', destinations.length);
          this.destinations = destinations;
          this.extractPaysOptions();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[ToutesDestinationComponent] Erreur chargement destinations:', error);
          this.errorMessage = 'Erreur lors du chargement des destinations';
          this.isLoading = false;
        }
      });
  }

  // Extraire les pays uniques pour le filtre
  private extractPaysOptions(): void {
    const paysSet = new Set<string>();
    this.destinations.forEach(dest => {
      if (dest.pays) {
        paysSet.add(dest.pays);
      }
    });
    this.paysOptions = Array.from(paysSet).sort();
    console.log('[ToutesDestinationComponent] Pays disponibles:', this.paysOptions);
  }

  // Appliquer tous les filtres
  applyFilters(): void {
    let filtered = [...this.destinations];

    // Filtre par nom (recherche)
    if (this.filters.search.trim()) {
      const searchTerm = this.filters.search.toLowerCase().trim();
      filtered = filtered.filter(dest => 
        dest.nom.toLowerCase().includes(searchTerm) ||
        (dest.description && dest.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre par pays
    if (this.filters.pays) {
      filtered = filtered.filter(dest => dest.pays === this.filters.pays);
    }

    // Filtre par prix minimum
    if (this.filters.prixMin !== null && this.filters.prixMin > 0) {
      filtered = filtered.filter(dest => dest.prix && dest.prix >= this.filters.prixMin!);
    }

    // Filtre par prix maximum
    if (this.filters.prixMax !== null && this.filters.prixMax > 0) {
      filtered = filtered.filter(dest => dest.prix && dest.prix <= this.filters.prixMax!);
    }

    this.filteredDestinations = filtered;
    this.updatePagination();
    
    console.log('[ToutesDestinationComponent] Filtres appliqués:', {
      total: this.destinations.length,
      filtrés: this.filteredDestinations.length,
      filtres: this.filters
    });
  }

  // Mettre à jour la pagination
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDestinations.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Obtenir les destinations pour la page actuelle
  getPaginatedDestinations(): Destination[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDestinations.slice(startIndex, endIndex);
  }

  // Navigation pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPaginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.filters = {
      search: '',
      pays: '',
      prixMin: null,
      prixMax: null
    };
    this.currentPage = 1;
    this.applyFilters();
    console.log('[ToutesDestinationComponent] Filtres réinitialisés');
  }

  // Gestionnaires d'événements pour les filtres
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPaysChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPriceChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // Choisir une destination et naviguer vers booking
  choisirDestination(destination: Destination): void {
    if (!this.currentUser) {
      this.errorMessage = 'Vous devez être connecté pour choisir une destination';
      // Optionnel : rediriger vers la page de connexion
      this.router.navigate(['/login']);
      return;
    }

    console.log('[ToutesDestinationComponent] Destination choisie:', destination.nom);

    // Convertir la destination en TravelRecommendation pour le composant booking
    const travelRecommendation: TravelRecommendation = {
      id: destination.id!,
      destination: destination.nom,
      climat: destination.climat || 'Climat tempéré',
      pays: destination.pays || 'Non spécifié',
      language: destination.langueLocale || 'Langue locale',
      price: this.formatPrice(destination.prix || 0),
      duration: this.getDefaultDuration(),
      rating: this.getDefaultRating(),
      image_placeholder: this.getImageUrl(destination),
      description: destination.description || 'Description non disponible',
      image: this.getImageUrl(destination),
      highlights: this.getHighlights(destination),
      activites: destination.activites || [],
      score: this.calculateScore(destination),
      matchPercentage: this.calculateMatchPercentage(destination)
    };
    this.selectedTrip = travelRecommendation;
    this.router.navigate(['/booking'], { state: { selectedTrip: travelRecommendation } });
   
   
  }

  // Méthodes utilitaires
  private formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  }

  private getDefaultDuration(): string {
    return '7 jours'; // Durée par défaut, peut être personnalisée
  }

  private getDefaultRating(): number {
    return 4.5; // Note par défaut
  }

  private calculateScore(destination: Destination): number {
    // Calculer un score basé sur les données disponibles
    let score = 70; // Score de base
    
    if (destination.description && destination.description.length > 50) score += 5;
    if (destination.activites && destination.activites.length > 0) score += destination.activites.length * 2;
    if (destination.climat) score += 5;
    if (destination.meilleurePeriode) score += 5;
    if (destination.langueLocale) score += 5;
    if (destination.photo) score += 10;
    
    return Math.min(score, 100); // Limiter à 100
  }

  private calculateMatchPercentage(destination: Destination): number {
    // Calculer un pourcentage de correspondance basique
    let match = 60; // Pourcentage de base
    
    if (destination.activites && destination.activites.length > 2) match += 15;
    if (destination.climat) match += 10;
    if (destination.description && destination.description.length > 100) match += 10;
    if (destination.prix && destination.prix > 0) match += 5;
    
    return Math.min(match, 100); // Limiter à 100
  }

  private getHighlights(destination: Destination): string[] {
    const highlights: string[] = [];
    
    if (destination.climat) {
      highlights.push(`Climat ${destination.climat}`);
    }
    
    if (destination.langueLocale) {
      highlights.push(`Langue: ${destination.langueLocale}`);
    }
    
    if (destination.meilleurePeriode) {
      highlights.push(`Meilleure période: ${destination.meilleurePeriode}`);
    }
    
    if (destination.activites && destination.activites.length > 0) {
      highlights.push(...destination.activites.slice(0, 2));
    }
    
    return highlights.length > 0 ? highlights : ['Destination populaire', 'Expérience unique'];
  }

  // Vérifier si une destination a une image
  hasImage(destination: Destination): boolean {
    return !!(destination.photo && destination.photo.trim());
  }

  // Obtenir l'URL de l'image ou une image par défaut
  getImageUrl(destination: Destination): string {
    if (this.hasImage(destination)) {
      // Si l'URL commence par http, l'utiliser directement, sinon ajouter le chemin de base
      return destination.photo!.startsWith('http') 
        ? destination.photo! 
        : `http://localhost:8000/storage/${destination.photo}`;
    }
    return '/assets/images/default-destination.jpg';
  }

  // Tronquer le texte de description
  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Vérifier si l'utilisateur est connecté
  isUserLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // Formater les activités pour l'affichage
  getFormattedActivities(activites: string[] | undefined): string {
    if (!activites || activites.length === 0) return 'Activités variées';
    
    if (activites.length <= 2) {
      return activites.join(', ');
    }
    
    return `${activites.slice(0, 2).join(', ')} (+${activites.length - 2})`;
  }
  onImageError(event: Event): void {
  const element = event.target as HTMLImageElement;
  element.src = '/assets/images/default-destination.jpg';
}
  selectTrip(trip: TravelRecommendation): void {
    console.log('[TravelBookingComponent] Voyage sélectionné:', trip);
    this.selectedTrip = trip;
    this.currentPageNav = 'booking';
  }

  onBookingCompleted(): void {
    console.log('[TravelBookingComponent] Réservation terminée');
    this.selectedTrip = null;
    this.currentPageNav = 'toutDestination';
    
   
  }


}
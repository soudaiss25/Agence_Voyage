// dashboard-client.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { User } from '../../models/user.inteface';
import { Voyage } from '../../models/voyage.inteface';
import { Recommandation } from '../../models/preference-client.inteface';
import { Destination } from '../../models/destination.inteface';
import { AuthService } from '../../services/auth.service';
import { VoyageService } from '../../services/voyage.service';
import { DestinationService } from '../../services/destination.service';
import { RecommendationService } from '../../services/recommendation.service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-dashbord-client',
  standalone: true,
  templateUrl: './dashbord-client.component.html',
  imports: [CommonModule],
  styleUrls: ['./dashbord-client.component.css']
})
export class DashbordClientComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données utilisateur
  utilisateur: User | null = null;
  
  // Statistiques
  nombreVoyages = 0;
  voyagesAVenir = 0;
  recommendations = 0;
  paysVisites = 0;
  
  // Données des voyages
  prochainsVoyages: Voyage[] = [];
  historiqueVoyages: Voyage[] = [];
  recommandationsActuelles: Recommandation[] = [];
  destinationsPopulaires: Destination[] = [];
  
  // États
  isLoading = true;
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private recommendationService: RecommendationService
  ) {}

  ngOnInit(): void {
    this.initialiserDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initialiserDashboard(): void {
    console.log('[Dashboard] Initialisation du dashboard');
    
    // Attendre que l'authentification soit prête
    this.authService.waitForAuth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isAuth) => {
          if (isAuth) {
            this.utilisateur = this.authService.getCurrentUserValue();
            this.chargerToutesDonnees();
          } else {
            console.error('[Dashboard] Utilisateur non authentifié');
            this.isLoading = false;
            this.errorMessage = 'Utilisateur non authentifié';
          }
        },
        error: (error) => {
          console.error('[Dashboard] Erreur d\'authentification:', error);
          this.isLoading = false;
          this.errorMessage = 'Erreur d\'authentification';
        }
      });
  }

  private chargerToutesDonnees(): void {
    console.log('[Dashboard] Chargement de toutes les données');

    // Charger toutes les données en parallèle
    forkJoin({
      voyages: this.voyageService.getAllVoyages(),
      destinations: this.destinationService.getDestinations(),
      recommendations: this.recommendationService.getRecommendations()
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (data) => {
        console.log('[Dashboard] Données chargées:', data);
        this.traiterVoyages(data.voyages);
        this.traiterDestinations(data.destinations);
        this.traiterRecommandations(data.recommendations);
        this.calculerStatistiques();
      },
      error: (error) => {
        console.error('[Dashboard] Erreur lors du chargement:', error);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.isLoading = false;
      }
    });
  }

  private traiterVoyages(voyages: Voyage[]): void {
    const maintenant = new Date();
    
    // Séparer les voyages passés et futurs
    this.prochainsVoyages = voyages.filter(voyage => {
      const dateDepart = new Date(voyage.dateDepart);
      return dateDepart > maintenant && voyage.statut !== 'annule';
    }).sort((a, b) => new Date(a.dateDepart).getTime() - new Date(b.dateDepart).getTime());

    this.historiqueVoyages = voyages.filter(voyage => {
      const dateRetour = new Date(voyage.dateRetour);
      return dateRetour <= maintenant || voyage.statut === 'termine';
    }).sort((a, b) => new Date(b.dateRetour).getTime() - new Date(a.dateRetour).getTime());

    console.log('[Dashboard] Voyages traités:', {
      futurs: this.prochainsVoyages.length,
      passes: this.historiqueVoyages.length
    });
  }

  private traiterDestinations(destinations: Destination[]): void {
    // Prendre les 6 premières destinations comme destinations populaires
    this.destinationsPopulaires = destinations.slice(0, 6);
    console.log('[Dashboard] Destinations populaires:', this.destinationsPopulaires.length);
  }

  private traiterRecommandations(recommendations: Recommandation[]): void {
    this.recommandationsActuelles = recommendations.slice(0, 3); // Limiter à 3 pour l'affichage
    console.log('[Dashboard] Recommandations actuelles:', this.recommandationsActuelles.length);
  }

  private calculerStatistiques(): void {
    this.nombreVoyages = this.historiqueVoyages.length;
    this.voyagesAVenir = this.prochainsVoyages.length;
    this.recommendations = this.recommandationsActuelles.length;
    
    // Calculer le nombre de pays uniques visités
    const paysUniques = new Set();
    this.historiqueVoyages.forEach(voyage => {
      if (voyage.destination?.pays) {
        paysUniques.add(voyage.destination.pays);
      }
    });
    this.paysVisites = paysUniques.size;

    console.log('[Dashboard] Statistiques calculées:', {
      nombreVoyages: this.nombreVoyages,
      voyagesAVenir: this.voyagesAVenir,
      recommendations: this.recommendations,
      paysVisites: this.paysVisites
    });
  }

  // Méthodes d'actions
  nouvelleRecherche(): void {
    console.log('Redirection vers la page de recherche');
    // Naviguer vers la page de recherche/destinations
  }

  planifierVoyage(): void {
    console.log('Planification d\'un nouveau voyage');
    // Naviguer vers la page de réservation
  }

  voirDetailsVoyage(voyageId: number): void {
    console.log('Détails du voyage:', voyageId);
    // Naviguer vers la page de détails du voyage
  }

  gererVoyage(voyageId: number): void {
    console.log('Gestion du voyage:', voyageId);
    // Naviguer vers la page de gestion du voyage
  }

  voirRecommandation(recommendationId: number): void {
    console.log('Voir recommandation:', recommendationId);
    const recommendation = this.recommandationsActuelles.find(r => r.id === recommendationId);
    if (recommendation) {
      // Naviguer vers les détails de la destination
      console.log('Navigation vers destination:', recommendation.destination?.nom);
    }
  }

  voirTousLesVoyages(): void {
    console.log('Affichage de tous les voyages');
    // Naviguer vers la page complète des voyages
  }

  voirToutesRecommandations(): void {
    console.log('Affichage de toutes les recommandations');
    // Naviguer vers la page des recommandations
  }

  obtenirRecommandations(): void {
    console.log('Génération de nouvelles recommandations');
    this.isLoading = true;
    
    this.recommendationService.generateRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[Dashboard] Nouvelles recommandations générées');
          // Recharger les recommandations
          this.chargerRecommandations();
        },
        error: (error) => {
          console.error('[Dashboard] Erreur génération recommandations:', error);
          this.isLoading = false;
        }
      });
  }

  private chargerRecommandations(): void {
    this.recommendationService.getRecommendations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recommendations) => {
          this.traiterRecommandations(recommendations);
          this.recommendations = recommendations.length;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[Dashboard] Erreur chargement recommandations:', error);
          this.isLoading = false;
        }
      });
  }

  // Méthodes utilitaires
  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'confirme':
        return 'bg-success';
      case 'en_attente':
        return 'bg-warning';
      case 'termine':
        return 'bg-primary';
      case 'annule':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatutText(statut: string): string {
    switch (statut) {
      case 'confirme':
        return 'Confirmé';
      case 'en_attente':
        return 'En attente';
      case 'termine':
        return 'Terminé';
      case 'annule':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatDateRange(dateDebut: string, dateFin: string): string {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };
    
    if (debut.getFullYear() !== fin.getFullYear()) {
      formatOptions.year = 'numeric';
    }
    
    const debutStr = debut.toLocaleDateString('fr-FR', formatOptions);
    const finStr = fin.toLocaleDateString('fr-FR', formatOptions);
    
    return `${debutStr} - ${finStr}`;
  }

  getPrixFormate(prix?: number): string {
  if (prix === undefined) {
    return '';
  }
  return prix.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}


  // Méthodes de gestion des erreurs
  retry(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.chargerToutesDonnees();
  }
}
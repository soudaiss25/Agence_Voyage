// src/app/services/recommendation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { switchMap, catchError, tap, retry, delay } from 'rxjs/operators';
import { PreferenceClient, Recommandation, TypeVoyage } from '../models/preference-client.inteface';
import { Destination } from '../models/destination.inteface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // ✅ Génération dynamique des headers avec JWT
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private ensureAuthenticated(): Observable<boolean> {
    return this.authService.waitForAuth().pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          console.error('[RecommendationService] Utilisateur non authentifié');
          return throwError(() => new Error('Utilisateur non authentifié'));
        }
        return of(isAuth);
      })
    );
  }

  savePreferences(preferences: PreferenceClient): Observable<any> {
    console.log('[RecommendationService] Tentative de sauvegarde des préférences:', preferences);

    if (!preferences || !preferences.climat || !preferences.budget || 
        !preferences.typeVoyage_id || !preferences.langueParlee || !preferences.activite) {
      const error = new Error('Les préférences sont incomplètes');
      console.error('[RecommendationService] Préférences invalides:', preferences);
      return throwError(() => error);
    }

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.post<any>(`${this.apiUrl}/preferences`, preferences, { headers: this.getAuthHeaders() });
      }),
      retry(1),
      tap(response => console.log('[RecommendationService] Préférences sauvegardées avec succès:', response)),
      catchError(error => this.handleError(error, 'Erreur lors de la sauvegarde des préférences'))
    );
  }

  getPreferences(): Observable<PreferenceClient> {
    console.log('[RecommendationService] Récupération des préférences');

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.get<PreferenceClient>(`${this.apiUrl}/preferences`, { headers: this.getAuthHeaders() });
      }),
      tap(preferences => console.log('[RecommendationService] Préférences récupérées:', preferences)),
      catchError(error => this.handleError(error, 'Erreur lors de la récupération des préférences'))
    );
  }

  generateRecommendations(): Observable<any> {
    console.log('[RecommendationService] Génération des recommandations');

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.post<any>(`${this.apiUrl}/recommendations/generate`, {}, { headers: this.getAuthHeaders() });
      }),
      retry({ count: 2, delay: () => of(null).pipe(delay(1000)) }),
      tap(response => console.log('[RecommendationService] Recommandations générées:', response)),
      catchError(error => this.handleError(error, 'Erreur lors de la génération des recommandations'))
    );
  }

  getRecommendations(): Observable<Recommandation[]> {
    console.log('[RecommendationService] Récupération des recommandations');

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.get<Recommandation[]>(`${this.apiUrl}/recommendations`, { headers: this.getAuthHeaders() });
      }),
      tap(recommendations => console.log('[RecommendationService] Recommandations récupérées:', recommendations.length)),
      catchError(error => this.handleError(error, 'Erreur lors de la récupération des recommandations'))
    );
  }

  addToFavorites(destinationId: number): Observable<any> {
    console.log('[RecommendationService] Ajout aux favoris, destination:', destinationId);

    if (!destinationId || destinationId <= 0) {
      return throwError(() => new Error('ID de destination invalide'));
    }

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.post<any>(`${this.apiUrl}/recommendations`, { destination_id: destinationId }, { headers: this.getAuthHeaders() });
      }),
      tap(response => console.log('[RecommendationService] Ajouté aux favoris:', response)),
      catchError(error => this.handleError(error, "Erreur lors de l'ajout aux favoris"))
    );
  }

  getTypesVoyage(): Observable<TypeVoyage[]> {
    console.log('[RecommendationService] Récupération des types de voyage');

    return this.http.get<TypeVoyage[]>(`${this.apiUrl}/types-voyage`).pipe(
      tap(types => console.log('[RecommendationService] Types de voyage récupérés:', types.length)),
      catchError(error => {
        console.error('[RecommendationService] Erreur récupération types voyage:', error);
        return of([]);
      })
    );
  }

  getDestinations(): Observable<Destination[]> {
    console.log('[RecommendationService] Récupération des destinations');

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.get<Destination[]>(`${this.apiUrl}/destinations`, { headers: this.getAuthHeaders() });
      }),
      tap(destinations => console.log('[RecommendationService] Destinations récupérées:', destinations.length)),
      catchError(error => this.handleError(error, 'Erreur lors de la récupération des destinations'))
    );
  }

  removeRecommendation(id: number): Observable<any> {
    console.log('[RecommendationService] Suppression recommandation:', id);

    return this.ensureAuthenticated().pipe(
      switchMap(() => {
        return this.http.delete(`${this.apiUrl}/recommendations/${id}`, { headers: this.getAuthHeaders() });
      }),
      tap(response => console.log('[RecommendationService] Recommandation supprimée:', response)),
      catchError(error => this.handleError(error, 'Erreur lors de la suppression de la recommandation'))
    );
  }

  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur réseau: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400: errorMessage = error.error?.message || 'Requête invalide'; break;
        case 401: errorMessage = 'Session expirée, veuillez vous reconnecter'; break;
        case 403: errorMessage = 'Accès refusé'; break;
        case 404: errorMessage = error.error?.message || 'Ressource non trouvée'; break;
        case 422: errorMessage = 'Données invalides: ' + (error.error?.message || 'Vérifiez vos informations'); break;
        case 500: errorMessage = 'Erreur serveur interne'; break;
        default: errorMessage = error.error?.message || defaultMessage;
      }
    }

    return throwError(() => ({ ...error, friendlyMessage: errorMessage }));
  }
}

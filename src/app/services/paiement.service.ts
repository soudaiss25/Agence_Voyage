import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './StorageService';

export interface Paiement {
  id: number;
  facture_id: number;
  montant: number;
  datePaiement: string;
  methode: string;
}

export interface PaiementResponse {
  clientSecret?: string; // pour Stripe
  url?: string;          // pour Wave
  paiement: Paiement;
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = 'http://localhost:8000/api/paiements';

  constructor(private http: HttpClient, private storageService: StorageService) {}

  // Méthode pour inclure le token JWT dans les headers
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.storageService.getToken(); // récupère le token JWT
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Récupérer tous les paiements du client connecté
  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.apiUrl, this.getAuthHeaders());
  }

  // Créer un paiement pour un voyage donné
  createPaiement(voyageId: number, montant: number, methode: 'stripe' | 'wave'): Observable<PaiementResponse> {
    const payload = {
      montant,
      methode
    };

    return this.http.post<PaiementResponse>(
      `${this.apiUrl}/${voyageId}`,
      payload,
      this.getAuthHeaders()
    );
  }
}

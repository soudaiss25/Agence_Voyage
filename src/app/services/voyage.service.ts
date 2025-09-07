import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Voyage } from '../models/voyage.inteface';
import { StorageService } from './StorageService';

export interface CreateVoyageRequest {
  prixTotal: number;
  destination_id: number;
  dateDepart: string;
  dateRetour: string;
  nombrePlaceReservee: number;
  typeHebergement: string;
  date_reservation: string;
  statut: string;
}

export interface VoyageResponse {
  message: string;
  voyage: Voyage;
}

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'http://localhost:8000/api/voyages';

  constructor(private http: HttpClient, private storageService: StorageService) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.storageService.getToken(); // récupère le token JWT
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  getAllVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.apiUrl, this.getAuthHeaders());
  }

  getVoyage(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  createVoyage(voyageData: CreateVoyageRequest): Observable<VoyageResponse> {
    return this.http.post<VoyageResponse>(this.apiUrl, voyageData, this.getAuthHeaders());
  }

  updateVoyage(id: number, voyageData: Partial<CreateVoyageRequest>): Observable<VoyageResponse> {
    return this.http.put<VoyageResponse>(`${this.apiUrl}/${id}`, voyageData, this.getAuthHeaders());
  }

  deleteVoyage(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  calculateTotalPrice(prixParPersonne: number, nombrePersonnes: number): number {
    return prixParPersonne * nombrePersonnes;
  }

  calculateReturnDate(departureDate: string, duration: number): string {
    const departure = new Date(departureDate);
    const returnDate = new Date(departure);
    returnDate.setDate(departure.getDate() + duration);
    return returnDate.toISOString().split('T')[0];
  }
}

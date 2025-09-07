import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.inteface';
import { Voyage } from '../models/voyage.inteface';
import { Avis } from '../models/avis.inteface';
import { Paiement } from '../models/paiement.inteface';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8000/api/admin';

  constructor(private http: HttpClient) {}

  // === UTILISATEURS ===
  getUtilisateurs(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/utilisateurs`);
  }

  supprimerUtilisateur(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/utilisateurs/${id}`);
  }

  // === VOYAGES ===
  getVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}/voyages`);
  }

  updateVoyage(id: number, statut: string): Observable<{ message: string, voyage: Voyage }> {
    return this.http.put<{ message: string, voyage: Voyage }>(`${this.apiUrl}/voyages/${id}`, { statut });
  }

  // === AVIS ===
  getAvis(): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/avis`);
  }

  supprimerAvis(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/avis/${id}`);
  }

  // === PAIEMENTS ===
  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/paiements`);
  }
}

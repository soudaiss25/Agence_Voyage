// src/app/services/destination.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from '../models/destination.inteface';


@Injectable({
  providedIn: 'root'
})
export class DestinationService {

  private apiUrl = 'http://localhost:8000/api/destinations'; // adapte selon ton backend

  constructor(private http: HttpClient) {}

  // Récupérer toutes les destinations
  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.apiUrl);
  }

  // Récupérer une destination par ID
  getDestination(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  // Ajouter une nouvelle destination
addDestination(destination: any, isFormData: boolean = false) {
  if (isFormData) {
    return this.http.post<Destination>(`${this.apiUrl}`, destination);
  }
  return this.http.post<Destination>(`${this.apiUrl}`, destination);
}

updateDestination(id: number, destination: any, isFormData: boolean = false) {
  if (isFormData) {
    return this.http.post<Destination>(`${this.apiUrl}/${id}?_method=PUT`, destination);
  }
  return this.http.put<Destination>(`${this.apiUrl}/${id}`, destination);
}

  // Supprimer une destination
  deleteDestination(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
   getTypesVoyage(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8000/api/types-voyage`);
  }
}

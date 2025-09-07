// destination-management.component.ts

import { Component, OnInit } from '@angular/core';
import { Destination } from '../../models/destination.inteface';
import { DestinationService } from '../../services/destination.service';
import { FormBuilder, FormArray, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-destination-management',
  templateUrl: './destination.component.html',
  styleUrls: ['./destination.component.css']
})
export class DestinationComponent implements OnInit {

  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  paginatedDestinations: Destination[] = [];
  currentFile: File | null = null;
  typesVoyage: any[] = [];

  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Filtres
  filters = {
    status: '',
    country: '',
    search: ''
  };

  // Pays disponibles
  countries: string[] = ['France', 'Espagne', 'Italie', 'Grèce', 'Portugal', 'Croatie'];

  // Modal
  currentDestination: Destination = this.getEmptyDestination();
  destinationToDelete: Destination | null = null;
  isEditing: boolean = false;
  activitiesString: string = '';

  // ✅ Ajout du FormArray pour les activités
  activitiesFormArray: FormArray = this.fb.array([]);

  // Loading states
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Modals Bootstrap
  private addModal: any;
  private deleteModal: any;

  constructor(
    private destinationService: DestinationService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
    this.initializeModals();
     this.loadTypesVoyage();
  }
  loadTypesVoyage(): void {
  this.destinationService.getTypesVoyage().subscribe({
    next: (data) => this.typesVoyage = data,
    error: (err) => console.error("Erreur chargement types de voyage:", err)
  });
}

  initializeModals(): void {
    if (typeof document !== 'undefined') {
      // @ts-ignore : on déclare bootstrap comme global
      const bootstrap = (window as any).bootstrap;

      const addModalEl = document.getElementById('addDestinationModal');
      const deleteModalEl = document.getElementById('deleteModal');

      if (addModalEl && bootstrap) {
        this.addModal = new bootstrap.Modal(addModalEl);
      }

      if (deleteModalEl && bootstrap) {
        this.deleteModal = new bootstrap.Modal(deleteModalEl);
      }
    }
  }

  getEmptyDestination(): Destination {
    return {
      nom: '',
      pays: '',
      climat: '',
      description: '',
      langueLocale: '',
      activites: [],
      meilleurePeriode: '',
      prix: 0 
    };
  }

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.currentFile = input.files[0];
  }
}


  // CHARGEMENT DES DONNÉES
  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.getDestinations().subscribe({
      next: (data) => {
        this.destinations = data;
        this.filteredDestinations = [...this.destinations];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des destinations:', error);
        this.isLoading = false;
      }
    });
  }

  // FILTRAGE
  filterDestinations(): void {
    this.filteredDestinations = this.destinations.filter(dest => {
      const matchCountry = !this.filters.country || dest.pays === this.filters.country;
      
      const matchSearch = !this.filters.search || 
        dest.nom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (dest.pays && dest.pays.toLowerCase().includes(this.filters.search.toLowerCase())) ||
        (dest.description && dest.description.toLowerCase().includes(this.filters.search.toLowerCase()));

      return matchCountry && matchSearch;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  // PAGINATION
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDestinations.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedDestinations = this.filteredDestinations.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  // CRUD OPERATIONS
  openAddModal(): void {
    this.isEditing = false;
    this.currentDestination = this.getEmptyDestination();
    this.activitiesString = '';
    this.activitiesFormArray.clear(); 
     this.addActivityField();// ✅ reset
    this.addModal?.show();
  }

  editDestination(destination: Destination): void {
    this.isEditing = true;
    this.currentDestination = { ...destination };
    this.activitiesString = destination.activites ? destination.activites.join(', ') : '';

    // ✅ remplir le FormArray avec les activités existantes
    this.activitiesFormArray.clear();
    if (destination.activites) {
      destination.activites.forEach(act => this.activitiesFormArray.push(new FormControl(act)));
    }

    this.addModal?.show();
  }

  saveDestination(): void {
      if (!this.currentDestination.type_voyage_id) {
    alert("Veuillez choisir un type de voyage");
    return;
  }
  this.isSaving = true;

  // ✅ synchroniser les activités depuis le FormArray
  const activitiesFromArray = this.activitiesFormArray.value.filter((a: string) => a && a.trim() !== '');
  this.currentDestination.activites = activitiesFromArray;
    if (this.currentDestination.prix !== null && this.currentDestination.prix !== undefined) {
    this.currentDestination.prix = Number(this.currentDestination.prix);
  }


  // ✅ Préparer FormData
  const formData = new FormData();
  Object.entries(this.currentDestination).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v, i) => formData.append(`${key}[${i}]`, v));
      } else {
        formData.append(key, value as any);
      }
    }
  });

  if (this.currentFile) {
    formData.append('photo', this.currentFile);
  }

  if (this.isEditing && this.currentDestination.id) {
    this.destinationService.updateDestination(this.currentDestination.id, formData, true).subscribe({
      next: (updatedDestination) => {
        const index = this.destinations.findIndex(d => d.id === updatedDestination.id);
        if (index !== -1) {
          this.destinations[index] = updatedDestination;
        }
        this.addModal?.hide();
        this.filterDestinations();
        this.isSaving = false;
        this.currentFile = null;
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.isSaving = false;
      }
    });
  } else {
    this.destinationService.addDestination(formData, true).subscribe({
      next: (newDestination) => {
        this.destinations.push(newDestination);
        this.addModal?.hide();
        this.filterDestinations();
        this.isSaving = false;
        this.currentFile = null;
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout:', error);
        this.isSaving = false;
      }
    });
  }
}

  confirmDelete(destination: Destination): void {
    this.destinationToDelete = destination;
    this.deleteModal?.show();
  }

  deleteDestination(): void {
    if (this.destinationToDelete && this.destinationToDelete.id) {
      this.destinationService.deleteDestination(this.destinationToDelete.id).subscribe({
        next: () => {
          this.destinations = this.destinations.filter(d => d.id !== this.destinationToDelete!.id);
          this.deleteModal?.hide();
          this.filterDestinations();
          this.destinationToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  // ✅ Méthodes pour manipuler le FormArray
  get activitiesControls(): FormControl[] {
  return this.activitiesFormArray.controls as FormControl[];
}

  addActivityField(): void {
    this.activitiesFormArray.push(new FormControl(''));
  }

  removeActivityField(index: number): void {
    this.activitiesFormArray.removeAt(index);
  }

  // UTILITY METHODS
  exportDestinations(): void {
    const dataStr = JSON.stringify(this.destinations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'destinations.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  refreshData(): void {
    this.loadDestinations();
  }

  getDisplayName(destination: Destination): string {
    return destination.nom;
  }

  getDisplayCountry(destination: Destination): string {
    return destination.pays || 'Non spécifié';
  }

  getDisplayClimate(destination: Destination): string {
    return destination.climat || 'Non spécifié';
  }

  getDisplayDescription(destination: Destination): string {
    return destination.description || 'Aucune description';
  }

  getActivitiesCount(destination: Destination): number {
    return destination.activites ? destination.activites.length : 0;
  }

  getFormattedDate(destination: Destination): Date {
    return destination.updated_at || destination.created_at || new Date();
  }
  getPhotoUrl(path: string): string {
  return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
}
logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout(); // ← Utilise votre AuthService existant
    }
  }
}

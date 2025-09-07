import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.inteface';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-user-gestion',
  standalone : true ,
  templateUrl: './user-gestion.component.html',
  imports: [CommonModule,FormsModule],
  styleUrl: './user-gestion.component.css'
})
export class UserGestionComponent implements OnInit {
  
  users: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  currentSection: string = 'users';
  
  // Filtres
  userFilter = {
    role: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  };

  constructor(private userService: UserService,private router: Router,private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // === NAVIGATION ===
  setCurrentSection(section: string): void {
    this.currentSection = section;
    // Ici vous pourriez ajouter la logique de navigation vers d'autres composants
    // par exemple avec Router.navigate()
  }

   goToDestinations(): void {
  this.router.navigate(['/destination']);
}

  // === CHARGEMENT DES DONNÉES ===
  loadUsers(): void {
    this.userService.getUtilisateurs().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        // Ici vous pourriez ajouter une notification d'erreur
      }
    });
  }

  refreshData(): void {
    this.loadUsers();
  }

  // === FILTRAGE ===
  getFilteredUsers(): User[] {
    let filtered = this.users;

    // Filtre par rôle
    if (this.userFilter.role) {
      filtered = filtered.filter(user => user.role === this.userFilter.role);
    }

    // Filtre par terme de recherche
    if (this.userFilter.searchTerm) {
      const searchTerm = this.userFilter.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.nom.toLowerCase().includes(searchTerm) ||
        user.prenom.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.login.toLowerCase().includes(searchTerm) ||
        user.telephone.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre par date
    if (this.userFilter.dateFrom) {
      filtered = filtered.filter(user => 
        user.created_at && new Date(user.created_at) >= new Date(this.userFilter.dateFrom)
      );
    }

    if (this.userFilter.dateTo) {
      filtered = filtered.filter(user => 
        user.created_at && new Date(user.created_at) <= new Date(this.userFilter.dateTo)
      );
    }

    return filtered;
  }

  // === PAGINATION ===
  getPaginatedItems(items: User[]): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  getTotalPages(items: User[]): number {
    return Math.ceil(items.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    const totalPages = this.getTotalPages(this.getFilteredUsers());
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
    }
  }

  // === ACTIONS UTILISATEURS ===
  editUser(user: User): void {
    // Logique pour éditer un utilisateur
    console.log('Édition de l\'utilisateur:', user);
    // Ici vous pourriez ouvrir un modal d'édition ou naviguer vers une page d'édition
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.userService.supprimerUtilisateur(userId).subscribe({
        next: (response) => {
          console.log(response.message);
          // Recharger la liste après suppression
          this.loadUsers();
          // Ici vous pourriez ajouter une notification de succès
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          // Ici vous pourriez ajouter une notification d'erreur
        }
      });
    }
  }

  exportUsers(): void {
    // Logique d'export des utilisateurs
    const csvData = this.convertToCSV(this.getFilteredUsers());
    this.downloadCSV(csvData, 'utilisateurs.csv');
  }

  // === UTILITAIRES ===
  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'user':
        return 'bg-success';
      case 'guide':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'user':
        return 'Utilisateur';
      case 'guide':
        return 'Guide';
      default:
        return role;
    }
  }

  // === STATISTIQUES ===
  getAdminCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getUserCount(): number {
    return this.users.filter(user => user.role === 'user').length;
  }

  getGuideCount(): number {
    return this.users.filter(user => user.role === 'guide').length;
  }

  // === EXPORT CSV ===
  private convertToCSV(users: User[]): string {
    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Login', 'Rôle', 'Téléphone', 'Date d\'inscription'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.nom}"`,
        `"${user.prenom}"`,
        `"${user.email}"`,
        `"${user.login}"`,
        `"${user.role}"`,
        `"${user.telephone}"`,
        user.created_at ? `"${this.formatDate(user.created_at)}"` : '""'
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout(); // ← Utilise votre AuthService existant
    }
  }
}
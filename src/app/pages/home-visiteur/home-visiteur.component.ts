import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.inteface';

@Component({
  selector: 'app-home-visiteur',
  templateUrl: './home-visiteur.component.html',
  styleUrls: ['./home-visiteur.component.css']
})
export class HomeVisiteurComponent implements OnInit {

  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 1) Vérification instantanée
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUserValue();

    // 2) S’abonner pour réagir aux changements (login/logout)
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout(); // ← Utilise votre AuthService existant
    }
  }
}

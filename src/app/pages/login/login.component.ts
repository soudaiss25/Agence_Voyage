// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.inteface';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '';
  rememberMe = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    // Récupérer l'URL de retour depuis les paramètres de requête
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get f() { return this.loginForm.controls; }

  get email() { return this.loginForm.get('email'); }
  get motDePasse() { return this.loginForm.get('motDePasse'); }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Arrêter si le formulaire n'est pas valide
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    const credentials: LoginRequest = {
      email: this.f['email'].value,
      motDePasse: this.f['motDePasse'].value
    };

    this.authService.login(credentials).subscribe({
  next: (response) => {
    console.log('Connexion réussie:', response);

    // Récupérer l'utilisateur courant
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        // Redirection selon le rôle
        if (user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'client') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/']); 
        }
      },
      error: (err) => {
        console.error('Erreur récupération utilisateur:', err);
        this.router.navigate(['/']); // fallback
      }
    });
  },
  error: (error) => {
    console.error('Erreur de connexion:', error);
    this.handleLoginError(error);
    this.loading = false;
  }
});

  }

  // Gestion des erreurs de connexion
  private handleLoginError(error: any): void {
    if (error.status === 401) {
      this.error = 'Email ou mot de passe incorrect.';
    } else if (error.status === 422) {
      this.error = 'Données invalides. Vérifiez vos informations.';
    } else if (error.status === 0) {
      this.error = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else {
      this.error = 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.';
    }
  }

  // Méthode pour la connexion via Google (à implémenter selon vos besoins)
  loginWithGoogle(): void {
    console.log('Connexion avec Google');
    // Implémenter la logique de connexion Google
  }

  // Méthode pour la connexion via Facebook (à implémenter selon vos besoins)  
  loginWithFacebook(): void {
    console.log('Connexion avec Facebook');
    // Implémenter la logique de connexion Facebook
  }

  // Méthode pour naviguer vers la page d'inscription
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Méthode pour gérer le mot de passe oublié
  forgotPassword(): void {
    console.log('Mot de passe oublié');
    // Implémenter la logique de récupération de mot de passe
    this.router.navigate(['/forgot-password']);
  }

  // Méthodes utiles pour la validation des champs
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'L\'email' : 'Le mot de passe'} est requis.`;
      }
      if (field.errors['email']) {
        return 'Format d\'email invalide.';
      }
      if (field.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      }
    }
    return '';
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout(); // ← Utilise votre AuthService existant
    }
  }
}
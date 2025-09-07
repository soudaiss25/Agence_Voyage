import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
   standalone : true,
    imports:[CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // ⚠️ "styleUrl" → "styleUrls"
})
export class RegisterComponent implements OnInit {
  
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['client'] // tu peux mettre "client" par défaut
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { confirmPassword, ...formValue } = this.registerForm.value;
    
    if (formValue.motDePasse !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.authService.register(formValue).subscribe({
      next: (res) => {
        console.log('Inscription réussie ✅', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur inscription ❌', err);
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}

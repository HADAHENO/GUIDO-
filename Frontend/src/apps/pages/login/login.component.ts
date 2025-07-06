import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatSnackBarModule,
    TranslocoModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitted = false;
  returnUrl = '';
  currentLang: string;
  isDarkMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translocoService: TranslocoService,
    private renderer: Renderer2
  ) {
    this.currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.checkDarkModePreference();
  }

  get fc() {
    return this.loginForm.controls;
  }

  submit(): void {
    this.isSubmitted = true;
    console.log('Form submission started');

    if (this.loginForm.invalid) {
      console.log('Form invalid, errors:', {
        email: this.fc['email'].errors,
        password: this.fc['password'].errors
      });
      this.toastr.warning(this.translocoService.translate('login.errors.fillRequired'));
      return;
    }

    console.log('Form valid, submitting:', this.loginForm.value);
    
    this.authService.login({
      email: this.fc['email'].value,
      password: this.fc['password'].value
    }).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        const userRole = response.data.role;
        
        if (userRole === 'Student') {
          this.router.navigateByUrl('/student-page');
        } else if (userRole === 'Admin') {
          this.router.navigateByUrl('/admin-page');
        } else {
          this.toastr.warning(this.translocoService.translate('login.errors.unknownRole'));
          this.router.navigateByUrl('/');
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        this.toastr.error(this.translocoService.translate('login.errors.loginFailed'));
      }
    });
  }

  switchLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  private checkDarkModePreference(): void {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (!savedMode && systemPrefersDark)) {
      this.toggleTheme();
    }
  }
}
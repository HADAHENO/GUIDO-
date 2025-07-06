import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ 
    CommonModule, 
    RouterModule,  
    FormsModule, 
    ReactiveFormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  student!: Student;
  newPassword: string = '';
  confirmPassword: string = '';
  isDarkMode = false;
  isUpdating = false;
  currentLang: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
    private darkModeService: DarkModeService,
    private translocoService: TranslocoService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
    this.authService.studentObservable.subscribe((newStudent) => {
      if (newStudent) {
        this.student = newStudent;
      }
    });
  }

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  updatePassword(): void {
    if (this.isUpdating) return;
    
    // Validate inputs
    if (!this.newPassword || !this.confirmPassword) {
      this.toastrService.warning(this.translocoService.translate('profile.errors.fillAllFields'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastrService.warning(this.translocoService.translate('profile.errors.passwordsNotMatch'));
      return;
    }

    if (this.newPassword.length < 8) {
      this.toastrService.warning(this.translocoService.translate('profile.errors.passwordTooShort'));
      return;
    }

    this.isUpdating = true;
    
    this.authService.updatePassword(this.newPassword, this.confirmPassword).subscribe({
      next: (response) => {
        this.newPassword = '';
        this.confirmPassword = '';
        this.toastrService.success(
          response.message || this.translocoService.translate('profile.success.passwordUpdated')
        );
      },
      error: (error) => {
        this.toastrService.error(
          error.error?.message || this.translocoService.translate('profile.errors.updateFailed')
        );
        this.isUpdating = false;
      },
      complete: () => {
        this.isUpdating = false;
      }
    });
  }

  switchLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Student } from '../../shared/DTOs/Student';
import { BASE_URL } from '../../shared/constants/urls';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule],
  templateUrl: './student-header.component.html',
  styleUrls: ['./student-header.component.css']
})
export class StudentHeaderComponent implements OnInit {
  student!: Student;
  BASE_URL = BASE_URL;
  isCollapsed = true;
  isDarkMode = false;
  currentLang: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translocoService: TranslocoService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
    
    this.authService.studentObservable.subscribe((newStudent) => {
      if (newStudent) {
        this.student = newStudent;
      }
    });

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.updateIconColors();
  }

  ngOnInit(): void {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.updateIconColors();
  }

  switchLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }

  private updateIconColors(): void {
    setTimeout(() => {
      document.querySelectorAll('.side-navbar-link i').forEach(icon => {
        (icon as HTMLElement).style.color = this.isDarkMode ? 'black' : 'white';
      });
    }, 100);
  }

  toggleLanguage(): void {
  const newLang = this.currentLang === 'en' ? 'ar' : 'en';
  this.translocoService.setActiveLang(newLang);
  this.currentLang = newLang;
  document.documentElement.lang = newLang;
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('language', newLang);
}
}
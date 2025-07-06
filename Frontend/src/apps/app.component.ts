import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { App } from '@capacitor/app';
import { MatDialog } from '@angular/material/dialog';
import { ExitConfirmComponent } from './pages/exit-confirm/exit-confirm.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ExitConfirmComponent], // Added ExitConfirmComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentLang: string;
  title = 'Guido';

  constructor(
    private translocoService: TranslocoService,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Initialize with saved language or default
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translocoService.setActiveLang(this.currentLang);
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }

  ngOnInit() {
    this.setupBackButtonListener();
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);
  }

  private setupBackButtonListener() {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack || this.router.url === '/') {
        this.showExitConfirm();
      } else {
        window.history.back();
      }
    });
  }

  private showExitConfirm() {
    const dialogRef = this.dialog.open(ExitConfirmComponent, {
      width: '300px',
      disableClose: true,
      panelClass: 'exit-confirm-dialog' // Optional: for custom styling
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) App.exitApp();
    });
  }
}
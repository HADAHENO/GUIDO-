import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-land',
  standalone: true,
  imports: [RouterModule, TranslocoModule, CommonModule],
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.css']
})
export class LandComponent implements OnInit {
  currentLang: string;

  constructor(private translocoService: TranslocoService) {
    this.currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit() {
    this.detectInitialLanguage();
  }

  private detectInitialLanguage() {
    const browserLang = navigator.language.substring(0, 2);
    const supportedLangs = ['en', 'ar'];
    const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
    
    this.switchLanguage(defaultLang);
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.switchLanguage(newLang);
  }

  private switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Optional: Save language preference
    localStorage.setItem('userLang', lang);
  }
}
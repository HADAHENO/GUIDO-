import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-info',
  imports: [RouterModule, CommonModule, FormsModule, TranslocoModule],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css'
})
export class InfoComponent implements OnInit {
  isDarkMode = false;
  currentLang: string = 'en';

  constructor(
    private el: ElementRef,
    private translocoService: TranslocoService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.forceLightMode();
    this.showSectionsImmediately();
    this.checkScroll();
    this.currentLang = this.translocoService.getActiveLang();
  }



 private forceLightMode(): void {
    this.isDarkMode = false;
    this.renderer.removeClass(document.body, 'dark-mode');
    this.renderer.removeClass(document.querySelector('.landing-page'), 'dark-mode');
  }

  toggleTheme(initialLoad = false): void {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
      this.renderer.addClass(document.querySelector('.landing-page'), 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      this.renderer.removeClass(document.querySelector('.landing-page'), 'dark-mode');
    }
  }

  switchLanguage(lang: string) {
    this.currentLang = lang;
    this.translocoService.setActiveLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.checkScroll();
  }

  checkScroll() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop < window.innerHeight - 100) {
        section.classList.add('show');
      }
    });
  }

  private showSectionsImmediately() {
    const sections = this.el.nativeElement.querySelectorAll('.section, .fade-in, .zoom-in');
    sections.forEach((section: HTMLElement) => {
      section.classList.add('show');
    });
  }
}
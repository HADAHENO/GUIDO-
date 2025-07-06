import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Transloco imports
import { TranslocoHttpLoader } from './app/services/transloco-loader';
import { 
  provideTransloco,
  TranslocoModule
} from '@ngneat/transloco';
import { provideTranslocoLocale } from '@ngneat/transloco-locale';

// Auth Interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/shared/auth/AuthInterceptor';
import { ModalModule } from 'ngx-bootstrap/modal';
import { provideMarkdown } from 'ngx-markdown';

bootstrapApplication(AppComponent, {
  providers: [
    provideMarkdown(), 
    provideRouter(routes),
    importProvidersFrom(ModalModule.forRoot()),
    provideHttpClient(
      withInterceptorsFromDi() 
    ),
    provideAnimations(),
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 3000,
      })
    ),
    importProvidersFrom(MatFormFieldModule),
    importProvidersFrom(MatInputModule),
    importProvidersFrom(MatButtonModule),
    importProvidersFrom(MatDialogModule),
    importProvidersFrom(MatCardModule),
    importProvidersFrom(MatIconModule),
    importProvidersFrom(MatGridListModule),
    importProvidersFrom(FormsModule),
    importProvidersFrom(NgbModule),
    
    // Transloco providers
    provideTransloco({
      config: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
      },
      loader: TranslocoHttpLoader
    }),
    provideTranslocoLocale({
      langToLocaleMapping: {
        en: 'en-US',
        ar: 'ar-EG'
      }
    }),
    importProvidersFrom(TranslocoModule),
    
    // Auth Interceptor provider
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
}).catch((err) => console.error(err));
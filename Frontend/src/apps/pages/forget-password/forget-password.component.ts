import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forget-password',
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
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm!: FormGroup;
  isSubmitted = false;
  currentLang: string;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private translocoService: TranslocoService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
    this.forgetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get fc() {
    return this.forgetPasswordForm.controls;
  }

  submit(): void {
    this.isSubmitted = true;

    if (this.forgetPasswordForm.invalid) {
      this.toastr.error(
        this.translocoService.translate('forgetPassword.errors.invalidEmail'),
        this.translocoService.translate('common.error')
      );
      return;
    }

    const email = this.fc['email'].value;

    this.authService.forgetPassword(email).subscribe({
      next: () => {
        this.toastr.success(
          this.translocoService.translate('forgetPassword.success.resetLinkSent'),
          // this.translocoService.translate('common.success')
        );
      },
      error: () => {
        this.toastr.error(
          this.translocoService.translate('forgetPassword.errors.failedToSend'),
          this.translocoService.translate('common.error')
        );
      }
    });
  }

  switchLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
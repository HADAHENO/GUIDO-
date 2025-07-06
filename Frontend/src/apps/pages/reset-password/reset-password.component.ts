import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ResetPassword } from '../../shared/DTOs/ResetPassword';
import { AuthService } from '../../services/auth.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isSubmitted = false;
  emailToReset!: string;
  emailToken!: string;
  currentLang: string;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translocoService: TranslocoService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
    this.parseQueryParams();
    this.initializeForm();
  }

  private parseQueryParams(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.emailToReset = params['email'] || '';
      const token = params['code'] || '';
      this.emailToken = token.replace(/  /g, '+');
    });
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', [Validators.required]]
      },
      { validator: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(formGroup: FormGroup): null | { notMatching: true } {
    const password = formGroup.get('password')?.value;
    const confirm = formGroup.get('confirm')?.value;
    return password === confirm ? null : { notMatching: true };
  }

  get fc() {
    return this.resetPasswordForm.controls;
  }

  submit(): void {
    this.isSubmitted = true;

    if (this.resetPasswordForm.invalid) {
      this.toastr.warning(
        this.translocoService.translate('resetPassword.errors.fillCorrectly'),
        this.translocoService.translate('common.warning')
      );
      return;
    }

    const resetPasswordPayload: ResetPassword = {
      email: this.emailToReset,
      emailToken: this.emailToken,
      password: this.fc['password'].value,
      confirm: this.fc['confirm'].value
    };

    this.authService.resetPassword(resetPasswordPayload).subscribe({
      next: () => {
        this.toastr.success(
          this.translocoService.translate('resetPassword.success.resetSuccessful'),
          this.translocoService.translate('common.success')
        );
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
        this.toastr.error(
          this.translocoService.translate('resetPassword.errors.resetFailed'),
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
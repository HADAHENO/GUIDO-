// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
// import { Student } from '../../shared/DTOs/Student';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-register-student',
//   imports: [RouterModule, CommonModule, ReactiveFormsModule, TranslocoModule, FormsModule],
//   templateUrl: './register-student.component.html',
//   styleUrl: './register-student.component.css'
// })
// export class RegisterStudentComponent implements OnInit {
//   currentLang: string;

//   constructor(
//     private authService: AuthService, 
//     private router: Router, 
//     private toastr: ToastrService,
//     private translocoService: TranslocoService
//   ) {
//     this.currentLang = this.translocoService.getActiveLang();
//   }

//   ngOnInit(): void {}

//   onSubmit(form: NgForm) {
//     if (form.valid) {
//       const { firstName, lastName, email, password, confirmPassword } = form.value;
  
//       const emailPattern = /^[a-zA-Z]+_[0-9]+@fci\.helwan\.edu\.eg$/;
//       if (!emailPattern.test(email)) {
//         this.toastr.error(
//           this.translocoService.translate('register.errors.invalidEmailFormat'),
          
//         );
//         return;
//       }
  
//       if (password === confirmPassword) {
//         const student: Student = { firstName, lastName, email, password };
//         this.authService.registerStudent(student).subscribe(
//           response => {
//             this.toastr.success(
//               this.translocoService.translate('register.success.verificationSent'),
//               this.translocoService.translate('register.success.registrationSuccessful'),
//               {
//                 timeOut: 10000,
//                 positionClass: 'toast-bottom-right'
//               }
//             );
//             this.router.navigateByUrl('/login');
//           },
//           error => {
//             this.toastr.error(
//               this.translocoService.translate('register.errors.registrationFailed'),
             
//             );
//           }
//         );
//       } else {
//         this.toastr.error(
//           this.translocoService.translate('register.errors.passwordMismatch'),
//           this.translocoService.translate('register.errors.error'),
//           {
//             timeOut: 3000,
//             positionClass: 'toast-bottom-right'
//           }
//         );
//       }
//     } else {
//       this.toastr.warning(
//         this.translocoService.translate('register.errors.fillRequiredFields'),
      
//       );
//     }
//   }

//   switchLanguage(lang: string): void {
//     this.translocoService.setActiveLang(lang);
//     this.currentLang = lang;
//     document.documentElement.lang = lang;
//     document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, TranslocoModule, FormsModule],
  templateUrl: './register-student.component.html',
  styleUrl: './register-student.component.css'
})
export class RegisterStudentComponent implements OnInit {
  currentLang: string;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastr: ToastrService,
    private translocoService: TranslocoService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const { firstName, lastName, email, password, confirmPassword } = form.value;
  
      // Removed university email validation
      if (password === confirmPassword) {
        const student: Student = { firstName, lastName, email, password };
        this.authService.registerStudent(student).subscribe({
          next: (response) => {
            this.toastr.success(
              this.translocoService.translate('register.success.verificationSent'),
              this.translocoService.translate('register.success.registrationSuccessful'),
              {
                timeOut: 10000,
                positionClass: 'toast-bottom-right'
              }
            );
            this.router.navigateByUrl('/login');
          },
          error: (error) => {
            this.toastr.error(
              this.translocoService.translate('register.errors.registrationFailed'),
              this.translocoService.translate('register.errors.error'),
              {
                timeOut: 3000,
                positionClass: 'toast-bottom-right'
              }
            );
          }
        });
      } else {
        this.toastr.error(
          this.translocoService.translate('register.errors.passwordMismatch'),
          this.translocoService.translate('register.errors.error'),
          {
            timeOut: 3000,
            positionClass: 'toast-bottom-right'
          }
        );
      }
    } else {
      this.toastr.warning(
        this.translocoService.translate('register.errors.fillRequiredFields'),
        this.translocoService.translate('register.errors.warning'),
        {
          timeOut: 3000,
          positionClass: 'toast-bottom-right'
        }
      );
    }
  }

  switchLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
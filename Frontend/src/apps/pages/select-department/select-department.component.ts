import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { CoursesService } from '../../services/courses.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-select-department',
  standalone: true,
  imports: [ 
    CommonModule, 
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './select-department.component.html',
  styleUrls: ['./select-department.component.css']
})
export class SelectDepartmentComponent {
  selectedDepartment: string | null = null;

  constructor(
    private coursesService: CoursesService,
    private toastr: ToastrService,
    private translocoService: TranslocoService,
    private router: Router
  ) {}

  confirmDepartment(): void {
    if (!this.selectedDepartment) {
      this.toastr.warning(this.translocoService.translate('department.selectDepartmentWarning'));
      return;
    }

    this.coursesService.updateDepartment(this.selectedDepartment).subscribe({
      next: (response) => {
        if (response.message === "Department updated successfully." && response.data) {
          this.toastr.success(this.translocoService.translate('department.updateSuccess'));
          this.router.navigate(['/my-courses']);
        } else {
          this.toastr.warning(this.translocoService.translate('department.updateWarning'));
        }
      },
      error: (error) => {
        this.toastr.error(this.translocoService.translate('department.updateError'));
      }
    });
  }
}
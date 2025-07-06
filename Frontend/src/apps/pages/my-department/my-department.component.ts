import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { Course } from '../../shared/DTOs/Course';
import { AuthService } from '../../services/auth.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { CoursesService } from '../../services/courses.service';
import { ToastrService } from 'ngx-toastr';
import { UpdateCourse } from '../../shared/DTOs/UpdateCourse';

@Component({
  selector: 'app-my-department',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './my-department.component.html',
  styleUrl: './my-department.component.css'
})
export class MyDepartmentComponent implements OnInit {
  student!: Student;
  coreCourses: Course[] = [];
  electiveCourses: Course[] = [];
  selectedDepartment: string | null = null;
  departmentHours: number = 0;
  isDarkMode = false;
  allCourses: Course[] = [];
  disabledCourses: string[] = [];
  showAddButtonMap: { [courseCode: string]: boolean } = {};
  currentLang: string = 'en'; // Added to track current language

  @Output() calculatedHoursEvent = new EventEmitter<number>();
  isModalVisible = false;

  constructor(
    private authService: AuthService,
    private darkModeService: DarkModeService,
    private coursesService: CoursesService,
    private toastr: ToastrService,
    public translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.darkModeService.isDarkMode();

    // Subscribe to language changes
    this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.authService.studentObservable.subscribe((student) => {
      if (student) {
        this.student = student;

        // Check if student has a department (not General or undefined)
        if (student.department && student.department !== 'General') {
          this.selectedDepartment = student.department;
          this.fetchDepartmentCourses();
        } else {
          // Show modal only if department is General or not set
          this.isModalVisible = true;
        }
      }
    });
  }

  onDepartmentChange(event: any): void {
    this.selectedDepartment = event.target.value;
  }

  fetchDepartmentCourses(): void {
    if (!this.selectedDepartment) return;

    switch (this.selectedDepartment) {
      case 'CS':
        this.fetchCoursesByType('CS Core', 'CS Elective');
        break;
      case 'IS':
        this.fetchCoursesByType('IS Core', 'IS Elective');
        break;
      case 'AI':
        this.fetchCoursesByType('AI Core', 'AI Elective');
        break;
      case 'IT':
        this.fetchCoursesByType('IT Core', 'IT Elective');
        break;
      default:
        this.toastr.error(this.translocoService.translate('department.invalidDepartment'));
        return;
    }
  }

  confirmDepartment(): void {
    if (!this.selectedDepartment) {
      this.toastr.warning(this.translocoService.translate('department.selectDepartmentWarning'));
      return;
    }

    this.coursesService.updateDepartment(this.selectedDepartment).subscribe({
      next: (response) => {
        if (response.message === "Department updated successfully." && response.data) {
          this.authService.updateStudentDepartment(response.data);

          this.isModalVisible = false;
          this.fetchDepartmentCourses();
          // this.toastr.success(this.translocoService.translate('department.updateSuccess')); // Unmute if needed
        } else {
          // this.toastr.warning(this.translocoService.translate('department.updateWarning')); // Unmute if needed
        }
      },
      error: (error) => {
        // this.toastr.error(this.translocoService.translate('department.updateError')); // Unmute if needed
      }
    });
  }

  private fetchCoursesByType(coreType: string, electiveType: string): void {
    this.coreCourses = [];
    this.electiveCourses = [];
    this.allCourses = [];
    this.showAddButtonMap = {};

    this.coursesService.fetchCoreCourses(coreType).subscribe({
      next: (coreCourses) => {
        this.coreCourses = coreCourses.map((course) => {
          const grade = course.grade || 'none';
          this.showAddButtonMap[course.code] = grade === 'none';
          return {
            ...course,
            grade,
          };
        });
        this.allCourses = [...this.coreCourses, ...this.electiveCourses];
      },
      error: () => {
        this.toastr.error(this.translocoService.translate('department.failedLoadCore'));
      },
    });

    this.coursesService.fetchElectiveCourses(electiveType).subscribe({
      next: (electiveCourses) => {
        this.electiveCourses = electiveCourses.map((course) => {
          const grade = course.grade || 'none';
          this.showAddButtonMap[course.code] = grade === 'none';
          return {
            ...course,
            grade,
          };
        });
        this.allCourses = [...this.coreCourses, ...this.electiveCourses];
      },
      error: () => {
        this.toastr.error(this.translocoService.translate('department.failedLoadElective'));
      },
    });
  }

  canTakeCourse(course: Course): boolean {
    if (!course.prerequest_en) return true;
    const preRequestCourse = this.coreCourses.concat(this.electiveCourses).find((c) => c.code === course.prerequest_en);
    return preRequestCourse?.grade !== 'none' && preRequestCourse?.grade !== 'F';
  }

  calculateDepartmentHours(): number {
    return [...this.coreCourses, ...this.electiveCourses]
      .filter((course) => course.grade !== 'none' && course.grade !== 'F')
      .reduce((total, course) => total + (parseFloat(course.hours) || 0), 0);
  }

  closeModal(): void {
    if (!this.selectedDepartment) {
      this.toastr.warning(this.translocoService.translate('department.selectDepartmentWarning'));
      return;
    }
    this.confirmDepartment();
  }

  addCourse(course: Course): void {
    if (!course.grade || course.grade === 'none') {
      this.toastr.warning(this.translocoService.translate('department.selectGradeWarning'));
      return;
    }

    if (!this.canTakeCourse(course)) {
      this.toastr.error(this.translocoService.translate('department.prerequisiteError'));
      return;
    }

    if (!course.code) {
      this.toastr.error(this.translocoService.translate('department.missingCodeError'));
      return;
    }

    this.showAddButtonMap[course.code] = false;

    const updateCourse: UpdateCourse = {
      code: course.code,
      grade: course.grade,
      hours: parseInt(course.hours)
    };

    this.coursesService.updateCourse(updateCourse).subscribe({
      next: (response) => {
        if (response?.message === "Updated Successfully.") {
          this.toastr.success(
            this.translocoService.translate('department.courseAdded', { courseName: course.course_Name_en })
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          this.showAddButtonMap[course.code] = true;
          this.toastr.warning(
            this.translocoService.translate('department.updateWarning', { courseName: course.course_Name_en })
          );
        }
      },
      error: (error) => {
        this.showAddButtonMap[course.code] = true;
        this.toastr.error(
          this.translocoService.translate('department.addError', { courseName: course.course_Name_en })
        );
      }
    });
  }

  isCourseDisabled(course: Course): boolean {
    return this.disabledCourses.includes(course.code);
  }
}
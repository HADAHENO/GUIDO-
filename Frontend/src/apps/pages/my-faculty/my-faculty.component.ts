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
  selector: 'app-my-faculty',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './my-faculty.component.html',
  styleUrl: './my-faculty.component.css'
})
export class MyFacultyComponent implements OnInit {
  student!: Student;
  allCourses: Course[] = [];
  coreCourses: Course[] = [];
  electiveCourses: Course[] = [];
  facultyHours: number = 0;
  isDarkMode = false;
  disabledCourses: string[] = [];
  showAddButtonMap: { [courseCode: string]: boolean } = {};
  currentLang: string = 'en'; // Initialize with a default language

  @Output() calculatedHoursEvent = new EventEmitter<number>();

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

    this.authService.studentObservable.subscribe((newStudent) => {
      if (newStudent) {
        this.student = newStudent;
      }
    });

    this.loadCourses();
  }

  loadCourses(): void {
    this.coursesService.fetchFacultyCoreCourses().subscribe({
      next: (coreCourses) => {
        this.coreCourses = coreCourses.map((course) => {
          this.showAddButtonMap[course.code] = !course.grade || course.grade === 'none';
          return {
            ...course,
            grade: course.grade || 'none'
          };
        });
        this.allCourses = [...this.coreCourses, ...this.electiveCourses];
      },
      error: () => {
        this.toastr.error(this.translocoService.translate('faculty.failedLoadCore'));
      }
    });

    this.coursesService.fetchFacultyElectiveCourses().subscribe({
      next: (electiveCourses) => {
        this.electiveCourses = electiveCourses.map((course) => {
          this.showAddButtonMap[course.code] = !course.grade || course.grade === 'none';
          return {
            ...course,
            grade: course.grade || 'none'
          };
        });
        this.allCourses = [...this.coreCourses, ...this.electiveCourses];
      },
      error: () => {
        this.toastr.error(this.translocoService.translate('faculty.failedLoadElective'));
      }
    });
  }

  canTakeCourse(course: Course): boolean {
    if (!course.prerequest_en) return true;
    const preRequestCourse = this.allCourses.find((c) => c.code === course.prerequest_en);
    return preRequestCourse?.grade !== 'none' && preRequestCourse?.grade !== 'F';
  }

  calculateFacultyHours(): number {
    return [...this.coreCourses, ...this.electiveCourses]
      .filter((course) => course.grade !== 'none' && course.grade !== 'F')
      .reduce((total, course) => total + (parseFloat(course.hours) || 0), 0);
  }

  addCourse(course: Course): void {
    if (!course.grade || course.grade === 'none') {
      this.toastr.warning(this.translocoService.translate('faculty.selectGradeWarning'));
      return;
    }

    if (!this.canTakeCourse(course)) {
      this.toastr.error(this.translocoService.translate('faculty.prerequisiteError'));
      return;
    }

    if (!course.code) {
      this.toastr.error(this.translocoService.translate('faculty.missingCodeError'));
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
            this.translocoService.translate('faculty.courseAdded', { courseName: course.course_Name_en })
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          this.showAddButtonMap[course.code] = true;
          this.toastr.warning(
            this.translocoService.translate('faculty.updateWarning', { courseName: course.course_Name_en })
          );
        }
      },
      error: (error) => {
        this.showAddButtonMap[course.code] = true;
        this.toastr.error(
          this.translocoService.translate('faculty.addError', { courseName: course.course_Name_en })
        );
      }
    });
  }

  isCourseDisabled(course: Course): boolean {
    return this.disabledCourses.includes(course.code);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './transcript.component.html',
  styleUrl: './transcript.component.css'
})
export class TranscriptComponent implements OnInit {
  student!: Student | null;
  isDarkMode = false;
  transcriptData: any = null;
  isLoading = true;
  currentLang: string = 'en'; // Add currentLang property

  constructor(
    private authService: AuthService,
    private darkModeService: DarkModeService,
    public translocoService: TranslocoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.darkModeService.isDarkMode();
    // Subscribe to language changes
    this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.loadStudentData();
    this.loadTranscriptData();
  }

  loadStudentData(): void {
    this.authService.studentObservable.subscribe((student) => {
      this.student = student;
    });
  }

  loadTranscriptData(): void {
    this.isLoading = true;
    this.authService.getTranscript().subscribe({
      next: (data) => {
        this.transcriptData = data;
        this.updateStudentWithTranscript(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error(this.translocoService.translate('transcript.loadError'));
      }
    });
  }

  updateStudentWithTranscript(data: any): void {
    if (this.student) {
      this.student = {
        ...this.student,
        gpa: data.gpa,
        completedHours: data.totalHours,
        // Department is now handled directly in the template based on language
        // department: data.department_en // Removed this, as it's not strictly necessary to update student DTO for language
      };
    }
  }

  getCumulativeGrade(): string {
    if (this.currentLang === 'en' && this.transcriptData?.totalGpa_en) {
      return this.transcriptData.totalGpa_en;
    } else if (this.currentLang === 'ar' && this.transcriptData?.totalGpa_ar) {
      return this.transcriptData.totalGpa_ar;
    }

    // Fallback to old GPA calculation if language-specific totalGpa is not available
    const gpa = this.student?.gpa || this.transcriptData?.gpa;
    if (gpa !== undefined) {
      const gradeKey = this.getGradeKey(gpa);
      return this.translocoService.translate(`transcript.grades.${gradeKey}`);
    }
    return this.translocoService.translate('common.na');
  }

  getDepartmentName(): string {
    if (this.currentLang === 'en' && this.transcriptData?.department_en) {
      return this.transcriptData.department_en;
    } else if (this.currentLang === 'ar' && this.transcriptData?.department_ar) {
      return this.transcriptData.department_ar;
    }
    return this.translocoService.translate('common.na');
  }


  private getGradeKey(gpa: number): string {
    if (gpa >= 3.4) return 'excellent';
    else if (gpa >= 2.8) return 'veryGood';
    else if (gpa >= 2.4) return 'good';
    else if (gpa >= 2) return 'acceptable';
    else if (gpa >= 1.4) return 'weak';
    else return 'veryWeak';
  }
}
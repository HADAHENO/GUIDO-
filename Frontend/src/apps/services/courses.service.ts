import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from "rxjs";
import { ToastrService } from 'ngx-toastr';
import { Course } from "../shared/DTOs/Course";
import { UpdateCourse } from "../shared/DTOs/UpdateCourse";
import {
  ADD_COURSE_TO_STUDENT_URL,
  GET_AI_CORE_COURSE_URL,
  GET_AI_ELECTIVE_COURSE_URL,
  GET_CS_CORE_COURSE_URL,
  GET_CS_ELECTIVE_COURSE_URL,
  GET_F_CORE_COURSE_URL,
  GET_F_ELECTIVE_COURSE_URL,
  GET_G_CORE_COURSE_URL,
  GET_G_ELECTIVE_COURSE_URL,
  GET_IS_CORE_COURSE_URL,
  GET_IS_ELECTIVE_COURSE_URL,
  GET_IT_CORE_COURSE_URL,
  GET_IT_ELECTIVE_COURSE_URL,
  GET_TOTAL_HOURS_URL,
  MAKE_COURSES_URL,
  UPDATE_COURSES_URL,
  UPDATE_DEPARTMENT_URL
} from "../shared/constants/urls";
import { TotalHoursResponse } from "../shared/DTOs/hours";
import { TranslocoService } from "@ngneat/transloco";

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private coursesSubject = new BehaviorSubject<Course[]>([]);
    public coursesObservable = this.coursesSubject.asObservable();

    constructor(
        private http: HttpClient, 
        private toastrService: ToastrService,
        private translocoService: TranslocoService
    ) {}

    fetchCourses(url: string): Observable<Course[]> {
        return this.http.get<{ data: Course[] }>(url).pipe(
            map((response) => response.data),
            tap({
                next: (courses) => {
                    this.coursesSubject.next(courses);
                },
                error: () => {
                    this.toastrService.error(this.translocoService.translate('courses.failedToLoad'));
                }
            })
        );
    }

    fetchGeneralCoreCourses(): Observable<Course[]> {
        return this.fetchCourses(GET_G_CORE_COURSE_URL);
    }

    fetchGeneralElectiveCourses(): Observable<Course[]> {
        return this.fetchCourses(GET_G_ELECTIVE_COURSE_URL);
    }

    fetchFacultyCoreCourses(): Observable<Course[]> {
        return this.fetchCourses(GET_F_CORE_COURSE_URL);
    }

    fetchFacultyElectiveCourses(): Observable<Course[]> {
        return this.fetchCourses(GET_F_ELECTIVE_COURSE_URL);
    }

    fetchCoreCourses(coreType: string): Observable<Course[]> {
        let url: string;
    
        switch (coreType) {
            case 'CS Core':
                url = GET_CS_CORE_COURSE_URL;
                break;
            case 'IS Core':
                url = GET_IS_CORE_COURSE_URL;
                break;
            case 'AI Core':
                url = GET_AI_CORE_COURSE_URL;
                break;
            case 'IT Core':
                url = GET_IT_CORE_COURSE_URL;
                break;
            default:
                throw new Error('Unknown core course type');
        }
    
        return this.http.get<{ data: Course[] }>(url).pipe(
            map((response) => response.data),
            tap({
                next: () => {
                    // this.toastrService.success(this.translocoService.translate('courses.coreLoaded'));
                },
                error: () => {
                    this.toastrService.error(this.translocoService.translate('courses.failedLoadCore'));
                }
            })
        );
    }
    
    fetchElectiveCourses(electiveType: string): Observable<Course[]> {
        let url: string;
    
        switch (electiveType) {
            case 'CS Elective':
                url = GET_CS_ELECTIVE_COURSE_URL;
                break;
            case 'IS Elective':
                url = GET_IS_ELECTIVE_COURSE_URL;
                break;
            case 'AI Elective':
                url = GET_AI_ELECTIVE_COURSE_URL;
                break;
            case 'IT Elective':
                url = GET_IT_ELECTIVE_COURSE_URL;
                break;
            default:
                throw new Error('Unknown elective course type');
        }
    
        return this.http.get<{ data: Course[] }>(url).pipe(
            map((response) => response.data),
            tap({
                next: () => {
                    // this.toastrService.success(this.translocoService.translate('courses.electiveLoaded'));
                },
                error: () => {
                    this.toastrService.error(this.translocoService.translate('courses.failedLoadElective'));
                }
            })
        );
    }

    updateCourse(updateCourse: UpdateCourse): Observable<any> {
        if (!updateCourse) {
            this.toastrService.warning(this.translocoService.translate('courses.noCourseProvided'));
            return throwError(() => new Error('No course provided for update'));
        }
    
        const { code, grade, hours } = updateCourse;
        const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
    
        if (!code || !grade || isNaN(hours) || !validGrades.includes(grade)) {
            console.error('Invalid course:', updateCourse);
            this.toastrService.error(this.translocoService.translate('courses.invalidCourseData'));
            return throwError(() => new Error('Invalid course data provided'));
        }
    
        const requestBody = {
            code: code.trim(),
            grade: grade,
            hours: Number(hours)
        };
    
        return this.http.post<any>(UPDATE_COURSES_URL, requestBody).pipe(
            tap({
                next: (response) => {
                    if (response?.message === "Updated Successfully.") {
                        // this.toastrService.success(this.translocoService.translate('courses.updateSuccess'));
                    } else {
                        this.toastrService.warning(
                            this.translocoService.translate('courses.updateWarning', { message: response?.message })
                        );
                    }
                },
                error: (error) => {
                    const errorMsg = error.error?.message || 
                        this.translocoService.translate('courses.updateFailed');
                    this.toastrService.error(errorMsg);
                }
            }),
            catchError(error => {
                console.error('API Error Details:', error);
                return throwError(() => error);
            })
        );
    }

    getTotalHours(): Observable<TotalHoursResponse> {
        return this.http.get(GET_TOTAL_HOURS_URL, { responseType: 'text' }).pipe(
            tap(rawResponse => console.log('Raw response:', rawResponse)),
            map(rawResponse => {
                try {
                    return JSON.parse(rawResponse) as TotalHoursResponse;
                } catch (e) {
                    this.toastrService.error(this.translocoService.translate('courses.invalidResponse'));
                    throw new Error('Invalid JSON response');
                }
            }),
            catchError(error => {
                this.toastrService.error(this.translocoService.translate('courses.failedLoadHours'));
                return throwError(() => error);
            })
        );
    }

    updateDepartment(departmentName: string): Observable<any> {
        if (!['CS', 'IS', 'AI', 'IT'].includes(departmentName)) {
            this.toastrService.error(this.translocoService.translate('courses.invalidDepartment'));
            return throwError(() => new Error('Invalid department selected'));
        }
    
        return this.http.post<any>(UPDATE_DEPARTMENT_URL, { departmentName }).pipe(
            tap({
                next: () => {
                    this.toastrService.success(this.translocoService.translate('courses.departmentUpdated'));
                    localStorage.setItem('selectedDepartment', departmentName);
                },
                error: (error) => {
                    this.toastrService.error(this.translocoService.translate('courses.departmentUpdateFailed'));
                    console.error('Error updating department:', error);
                }
            }),
            catchError(error => {
                console.error('API Error:', error);
                return throwError(() => error);
            })
        );
    }
}
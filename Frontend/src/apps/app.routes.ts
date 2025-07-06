import { Routes } from '@angular/router';
import { LandComponent } from './pages/land/land.component';
import { InfoComponent } from './pages/info/info.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterStudentComponent } from './pages/register-student/register-student.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { StudentPageComponent } from './pages/student-page/student-page.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyCoursesComponent } from './pages/my-courses/my-courses.component';
import { MyGeneralComponent } from './pages/my-general/my-general.component';
import { MyFacultyComponent } from './pages/my-faculty/my-faculty.component';
import { MyDepartmentComponent } from './pages/my-department/my-department.component';
import { TranscriptComponent } from './pages/transcript/transcript.component';
import { AdminPageComponent } from './pages/admin/admin-page/admin-page.component';
import { SelectDepartmentComponent } from './pages/select-department/select-department.component';
import { ChatbotComponent } from './pages/chatbot/chatbot.component';
import { AuthGuard } from './shared/auth/guards/auth.guard';
import { ChatPdfComponent } from './pages/chat-pdf/chat-pdf.component';

export const routes: Routes = [
    // { path: '**', redirectTo:'', pathMatch: 'full'},
    { path: '', component:LandComponent},
    { path: 'info', component:InfoComponent},
    { path: 'login', component:LoginComponent},
    { path: 'forget-password', component: ForgetPasswordComponent},
    { path: 'reset-password', component: ResetPasswordComponent, canActivate:[AuthGuard]},
    { path: 'registerStudent', component: RegisterStudentComponent},
    { path: 'student-page', component: StudentPageComponent, canActivate:[AuthGuard]},
    { path: 'profile', component: ProfileComponent, canActivate:[AuthGuard]},
    { path: 'my-courses', component: MyCoursesComponent, canActivate:[AuthGuard]},
    { path: 'my-general', component: MyGeneralComponent, canActivate:[AuthGuard]},
    { path: 'my-faculty', component: MyFacultyComponent, canActivate:[AuthGuard]},
    { path: 'my-department', component: MyDepartmentComponent, canActivate:[AuthGuard]},
    { path: 'transcript', component: TranscriptComponent, canActivate:[AuthGuard]},
    { path: 'admin-page', component: AdminPageComponent, canActivate:[AuthGuard]},
    { path: 'select-department', component: SelectDepartmentComponent, canActivate:[AuthGuard]},
    { path: 'chatbot', component: ChatbotComponent, canActivate:[AuthGuard]},
    { path: 'chat-pdf', component: ChatPdfComponent, canActivate:[AuthGuard]},
    // { path: 'registerAdmin', component: RegisterAdminComponent},
     // { path: 'register', component:RegisterComponent},
];

import { Course } from "./Course";

export class Student{
    id?: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    password!: string;
    confirmPassword?: string;
    profilePic?: string;  
    level?: string;  
    department?: string;
    gpa?: number;  
    hours?: number;
    completedHours?: number; 
    courses?: { category: string, subjects: Course[] }; 
    token?: string;
}
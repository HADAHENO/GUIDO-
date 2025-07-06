import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatpdfService } from '../../services/chatpdf.service';

@Component({
  selector: 'app-student-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent
  ],
  templateUrl: './student-page.component.html',
  styleUrls: ['./student-page.component.css']
})
export class StudentPageComponent implements OnInit {
  student!: Student;
  currentLang: string;
  
  features = [
    {
      nameKey: 'student.features.lexi.name',
      captionKey: 'student.features.lexi.caption',
      image: 'assets/chatbot.jpg',
      link: '/chatbot',
    },
    {
      nameKey: 'student.features.courses.name',
      captionKey: 'student.features.courses.caption',
      image: 'assets/about.jpg',
      link: '/my-courses',
    },
    {
      nameKey: 'student.features.transcript.name',
      captionKey: 'student.features.transcript.caption',
      image: 'assets/t.jpg',
      link: '/transcript',
    },
    {
      nameKey: 'student.features.pdfQA.name',
      captionKey: 'student.features.pdfQA.caption',
      image: 'assets/v.jpg',
      link: '/chat-pdf',
    },
    // {
    //   nameKey: 'student.features.internships.name',
    //   captionKey: 'student.features.internships.caption',
    //   image: 'assets/i.webp',
    //   link: '/intership',
    // },
    // {
    //   nameKey: 'student.features.stress.name',
    //   captionKey: 'student.features.stress.caption',
    //   image: 'assets/st.jpg',
    //   link: '/stress',
    // },
  ];

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private translocoService: TranslocoService,
    private chatbotService: ChatbotService,
    private chatpdfService: ChatpdfService
  ) {
    this.currentLang = this.translocoService.getActiveLang();
    this.authService.studentObservable.subscribe((newStudent) => {
      if (newStudent) {
        this.student = newStudent;
      }
    });
  }

  ngOnInit(): void {}

  navigateTo(link: string) {
    if (link === '/chatbot') {
      this.startNewChatSession();
    } else if (link === '/chat-pdf') { // Add this condition for PDF Assistant
      this.startNewChatPdfSession();
    } 
    else {
      this.router.navigate([link]);
    }
  }


  private startNewChatSession() {
    this.chatbotService.startNewChat().subscribe({
      next: (response) => {
        console.log('New chat session started:', response); 
        this.router.navigate(['/chatbot'], { 
          queryParams: { chatId: response.data },
          state: { isNewChat: true } 
        });
      },
      error: (error) => {
        console.error('Error starting new chat session:', error);
        this.router.navigate(['/chatbot']);
      }
    });
  }

  private startNewChatPdfSession() {
    this.chatpdfService.startNewPdfChat().subscribe({
      next: (response) => {
        console.log('New PDF chat session started:', response); // Added for clarity
        this.router.navigate(['/chat-pdf'], { 
          queryParams: { chatId: response.data },
          state: { isNewChat: true }
        });
      },
      error: (error) => {
        console.error('Error starting new PDF chat session:', error); // Added for clarity
        this.router.navigate(['/chat-pdf']);
      }
    });
  }
}
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatpdfService } from '../../services/chatpdf.service';
import { finalize } from 'rxjs/operators';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-chat-pdf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent,
  ],
  templateUrl: './chat-pdf.component.html',
  styleUrls: ['./chat-pdf.component.css']
})
export class ChatPdfComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  student: Student | null = null;
  currentLang: string;
  isDarkMode: boolean = false;
  selectedFile: File | null = null;
  fileName: string = '';
  isLoading: boolean = false;
  uploadSuccess: boolean = false;
  errorMessage: string = '';
  chatId: number | null = null;
  isNewChat: boolean = false;
  showChat: boolean = false;
  userQuestion: string = '';
  isAsking: boolean = false;
  chatMessages: ChatMessage[] = [];
  isUploadSectionVisible: boolean = true;

  constructor(
    private authService: AuthService,
    private translocoService: TranslocoService,
    private chatpdfService: ChatpdfService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentLang = this.translocoService.getActiveLang();
    this.authService.studentObservable.subscribe((newStudent: Student | null) => {
      this.student = newStudent;
    });

    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.isDarkMode = event.matches;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.chatId = params['chatId'] ? Number(params['chatId']) : null;
      if (!this.chatId) {
        this.errorMessage = 'No chat ID provided in URL';
      }
    });

    const navigation = this.router.getCurrentNavigation();
    this.isNewChat = navigation?.extras?.state?.['isNewChat'] || false;
    
    if (this.isNewChat) {
      this.addWelcomeMessage();
    }
  }

  addWelcomeMessage(): void {
    this.chatMessages.push({
      text: 'Welcome to your new PDF chat session! Upload a PDF file to start asking questions about its content.',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Please select a PDF file';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'File size should not exceed 10MB';
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.uploadSuccess = false;
      this.errorMessage = '';
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first';
      return;
    }

    if (!this.chatId) {
      this.errorMessage = 'No chat session available';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.chatpdfService.uploadPdf(this.selectedFile, this.chatId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: string) => {
          this.uploadSuccess = true;
          this.fileName = response;
          this.showChat = true;
          this.isUploadSectionVisible = false;
          
          // Add success message to chat
          this.chatMessages.push({
            text: `PDF "${this.fileName}" uploaded successfully. You can now ask questions about this document.`,
            sender: 'bot',
            timestamp: new Date()
          });
          
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
        error: (err: Error) => {
          this.errorMessage = err.message || 'Failed to upload PDF';
          console.error('Upload error:', err);
        }
      });
  }

  askQuestion(): void {
    if (!this.userQuestion.trim()) return;
    if (!this.chatId || !this.fileName) return;

    const question = this.userQuestion.trim();
    this.chatMessages.push({
      text: question,
      sender: 'user',
      timestamp: new Date()
    });

    this.isAsking = true;
    this.userQuestion = '';

    this.chatpdfService.askQuestion(question, this.fileName, this.chatId)
      .subscribe({
        next: (response) => {
          this.chatMessages.push({
            text: response,
            sender: 'bot',
            timestamp: new Date()
          });
          this.isAsking = false;
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        },
        error: (err) => {
          this.chatMessages.push({
            text: 'Sorry, there was an error processing your question. Please try again.',
            sender: 'bot',
            timestamp: new Date()
          });
          this.isAsking = false;
          console.error('Error asking question:', err);
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        }
      });
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { 
      console.error(err);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  toggleUploadSection(): void {
    this.isUploadSectionVisible = !this.isUploadSectionVisible;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
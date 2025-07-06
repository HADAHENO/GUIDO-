import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { StudentHeaderComponent } from '../student-header/student-header.component';
import { Student } from '../../shared/DTOs/Student';
import { AuthService } from '../../services/auth.service';
import { ChatbotService } from '../../services/chatbot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import { MarkdownModule } from 'ngx-markdown';


type ChatMessage = {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isCode?: boolean;
  isThinking?: boolean;
};

type ChatHistoryItem = {
  id: number;
  title: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
};

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    StudentHeaderComponent,
    TruncatePipe,
    DatePipe,
     MarkdownModule,
    
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('historySidebar') private historySidebar!: ElementRef;

  student!: Student;
  currentLang: string;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  chatId!: number;
  chatHistory: ChatHistoryItem[] = [];
  isHistoryOpen = false;
  isHistoryLoading = false;
  selectedChatId: number | null = null;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private translocoService: TranslocoService,
    private chatbotService: ChatbotService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentLang = this.translocoService.getActiveLang();
    this.authService.studentObservable.subscribe((newStudent) => {
      if (newStudent) {
        this.student = newStudent;
        this.loadChatHistory();
      }
    });

    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.isDarkMode = event.matches;
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      const idFromQueryParams = +queryParamMap.get('chatId')!;
      
      const newChatId = !isNaN(idFromQueryParams) && idFromQueryParams > 0 ? idFromQueryParams : 0;

      if (newChatId !== this.chatId) {
        this.chatId = newChatId;
        this.selectedChatId = this.chatId;

        // Pass 'isNewChat' flag to loadChatMessages directly if it's the initial new session creation
        // The `isNewChat` state will be set by createNewChatSession/createNewChat functions
        // when they navigate.
        this.loadChatMessages(this.chatId);
        
      } else if (!this.chatId && newChatId === 0) {
          // This ensures createNewChatSession is called on first visit to /chatbot
          // if it hasn't been initialized yet.
          this.createNewChatSession();
      }
    });
  }

  private loadChatMessages(chatId: number): void {
    this.clearMessages();
    this.addBotMessage('chatbot.welcome_message');

    // Check the router state to see if this navigation originated from creating a new chat.
    // router.getCurrentNavigation() is available only during a navigation event.
    // If the page is refreshed or accessed directly with a chatId, state will be null.
    const navigation = this.router.getCurrentNavigation();
    const isNewChatFlag = navigation?.extras.state?.['isNewChat'];

    // Only fetch history if it's an existing chat (chatId > 0)
    // AND it's NOT a newly created chat session (identified by the flag).
    if (chatId > 0 && !isNewChatFlag) {
      this.isLoading = true;
      this.chatbotService.getChatMessages(chatId).subscribe({
        next: (apiMessages) => {
          const loadedMessages: ChatMessage[] = [];
          apiMessages.forEach(apiMsg => {
            loadedMessages.push({
              text: apiMsg.question,
              sender: 'user',
              timestamp: new Date() 
            });
            loadedMessages.push({
              text: apiMsg.answer,
              sender: 'bot',
              timestamp: new Date()
            });
          });

          this.messages = [...this.messages, ...loadedMessages];
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error loading chat messages:', error);
          this.isLoading = false;
          this.addBotMessage('chatbot.error_loading_messages');
        }
      });
    } else {
        // If it's a new chat (isNewChatFlag is true) or chatId is 0 (initial state before new chat ID),
        // we just clear messages and add the welcome message. No need to fetch history.
        this.isLoading = false; // Ensure loading is off
    }
  }

  private clearMessages(): void {
    this.messages = [];
    this.userInput = '';
    this.isLoading = false;
  }

  private loadChatHistory(): void {
    if (!this.student) return;
    
    this.isHistoryLoading = true;
    this.chatbotService.getChatHistory().subscribe({
      next: (history) => {
        this.chatHistory = history.map((chat: any) => ({
          id: chat.id,
          title: chat.title || `Chat ${chat.id}`,
          lastMessage: chat.lastMessage || '', 
          timestamp: chat.timestamp ? new Date(chat.timestamp) : undefined, 
          unreadCount: chat.unreadCount || 0 
        }));
        this.isHistoryLoading = false;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isHistoryLoading = false;
      }
    });
  }

  toggleHistory(): void {
    this.isHistoryOpen = !this.isHistoryOpen;
    if (this.isHistoryOpen && this.chatHistory.length === 0) {
      this.loadChatHistory();
    }
  }

  selectChat(chatId: number): void {
    if (chatId === this.chatId) {
      this.isHistoryOpen = false;
      return;
    }
    this.selectedChatId = chatId;
    // When selecting an existing chat, we don't pass isNewChat: true,
    // so loadChatMessages will correctly fetch its history.
    this.router.navigate(['/chatbot'], { queryParams: { chatId: chatId } });
    this.isHistoryOpen = false;
  }

  closeHistory(event: MouseEvent): void {
    if (this.historySidebar && this.historySidebar.nativeElement && !this.historySidebar.nativeElement.contains(event.target as Node)) {
        this.isHistoryOpen = false;
    }
  }

  private createNewChatSession(): void {
    this.isLoading = true;
    this.clearMessages();
    this.chatbotService.startNewChat().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.chatId = response.data;
        this.selectedChatId = this.chatId;
        // IMPORTANT: Pass { isNewChat: true } state to signify this is a newly created chat
        this.router.navigate(['/chatbot'], { queryParams: { chatId: response.data }, state: { isNewChat: true } });
        this.addBotMessage('chatbot.welcome_message');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating new chat:', error);
        this.addBotMessage('chatbot.error_message');
      }
    });
  }

  createNewChat(): void {
    this.isLoading = true;
    this.clearMessages();
    this.chatbotService.startNewChat().subscribe({
      next: (response) => {
        // IMPORTANT: Pass { isNewChat: true } state to signify this is a newly created chat
        this.router.navigate(['/chatbot'], { queryParams: { chatId: response.data }, state: { isNewChat: true } });
        this.selectedChatId = response.data;
        this.isLoading = false;
        this.isHistoryOpen = false;
        this.addBotMessage('chatbot.welcome_message');
      },
      error: (error) => {
        console.error('Error creating new chat:', error);
        this.isLoading = false;
        this.addBotMessage('chatbot.error_message');
      }
    });
  }

  formatChatTitle(title: string): string {
    if (title.startsWith('Chat ')) {
      const chatNumber = title.split(' ')[1];
      return this.translocoService.translate('chatbot.chat_number', { number: chatNumber });
    }
    return title;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput;
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isLoading = true;

    const thinkingMessageIndex = this.addBotMessage('', true);

    this.chatbotService.sendQuestion(userMessage, this.chatId).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        let botResponse = '';
        
        if (typeof response === 'string') {
          botResponse = response;
        } else if (response.answer) {
          botResponse = response.answer;
        } else if (response) {
          botResponse = JSON.stringify(response); 
        } else {
          botResponse = 'chatbot.default_response';
        }
        
        this.messages[thinkingMessageIndex] = {
          ...this.messages[thinkingMessageIndex],
          text: botResponse,
          isThinking: false
        };
      },
      error: (error) => {
        this.isLoading = false;
        console.error('API Error:', error);
        this.messages[thinkingMessageIndex] = {
          ...this.messages[thinkingMessageIndex],
          text: 'chatbot.error_message',
          isThinking: false
        };
      }
    });
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      text,
      sender: 'user',
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string, isThinking = false): number {
    const isCode = text.includes('```');
    const newMessage: ChatMessage = {
      text,
      sender: 'bot',
      timestamp: new Date(),
      isCode,
      isThinking
    };
    this.messages.push(newMessage);
    return this.messages.length - 1;
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.nativeElement.scrollTop = 
            this.messagesContainer.nativeElement.scrollHeight;
        }
      }, 100);
    } catch(err) { 
      console.error('Scroll to bottom failed:', err);
    }
  }

  formatTime(date: Date): string {
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  }

  copyToClipboard(text: string, event: MouseEvent): void {
    event.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

   startDeepThink(): void {
    this.userInput = 'Tell me more about DeepThink (R1).';
    this.sendMessage();
  }

  startSearch(): void {
    this.userInput = 'Perform a search about current events.';
    this.sendMessage();
  }
}
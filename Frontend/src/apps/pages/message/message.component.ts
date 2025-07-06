// message.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../shared/constants/markdown.pipe';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FormsModule, MarkdownPipe],
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnChanges {
  @Input() message!: { 
    content: string; 
    sender: 'user' | 'bot'; 
    timestamp: Date;
    status?: 'sending' | 'sent' | 'failed';
  };
  @Input() currentLang: string = 'en';
  parsedContent: string = '';

  constructor(private markdownPipe: MarkdownPipe) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && this.message.content) {
      const safeHtml = await this.markdownPipe.transform(this.message.content);
      // Extract the HTML string from SafeHtml
      this.parsedContent = safeHtml.toString();
    }
  }
}
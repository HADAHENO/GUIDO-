// input.component.ts
import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Output() sendMessage = new EventEmitter<string>();
  @ViewChild('textarea') textarea!: ElementRef;
  
  message = '';
  isFocused = false;

  onSend() {
    if (this.message.trim()) {
      this.sendMessage.emit(this.message.trim());
      this.message = '';
      this.focusInput();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  focusInput() {
    this.textarea.nativeElement.focus();
  }

  adjustHeight() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }
}
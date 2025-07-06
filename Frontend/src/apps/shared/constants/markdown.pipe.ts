import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as marked from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true,
  pure: false // Important for async pipes
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  async transform(value: string): Promise<SafeHtml> {
    if (!value) return '';
    
    try {
      // Handle both sync and async parsing
      const html = await marked.parse(value);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}
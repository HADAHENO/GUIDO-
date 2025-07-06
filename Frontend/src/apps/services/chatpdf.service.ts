import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, of, throwError } from 'rxjs'; 
import { map, catchError } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class ChatpdfService {
  private apiUrl = "https://eduguideai.runasp.net/api";
  private currentChatId: number | null = null; 

  constructor(private http: HttpClient) { }

  startNewPdfChat(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post(`${this.apiUrl}/Chat-PDF/NewChat`, {}, { headers });
  }

  uploadPdf(file: File, chatId: number): Observable<string> {
    if (!this.currentChatId && chatId) {
      this.currentChatId = chatId;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(
      `${this.apiUrl}/Upload-PDF?chatid=${chatId}`,
      formData,
      {
        responseType: 'text' 
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error uploading PDF:', error);
        return throwError(() => new Error('Failed to upload PDF'));
      })
    );
  }

 askQuestion(question: string, fileName: string, chatId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const body = {
      question: question,
      fileName: fileName,
      chatId: chatId
    };

    return this.http.post(`${this.apiUrl}/Ask-Question`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error asking question:', error);
        return throwError(() => new Error('Failed to ask question'));
      })
    );
  }

  getCurrentChatId(): number | null {
    return this.currentChatId;
  }

  setCurrentChatId(id: number): void {
    this.currentChatId = id;
  }
} 
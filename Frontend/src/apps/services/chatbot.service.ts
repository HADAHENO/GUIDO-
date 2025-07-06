import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { Observable, of, throwError } from 'rxjs'; // Import of and throwError
import { map, catchError } from 'rxjs/operators'; // Import catchError

// Define interfaces for the new API response structure
interface ApiHistoricalMessage {
  question: string;
  answer: string;
}

interface GetMessageApiResponse {
  message: string;
  state: string;
  data: ApiHistoricalMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = "https://eduguideai.runasp.net/api/Chat-Bot";

  private currentChatId: number | null = null; 

  constructor(private http: HttpClient) { }

  startNewChat(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return this.http.post(`${this.apiUrl}/NewChat`, {}, { headers });
  }

  sendQuestion(question: string, chatId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    const body = {
      question: question,
      chatId: chatId
    };
    
    return this.http.post(this.apiUrl, body, { headers });
  }

  getChatHistory(): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/History`, { headers });
  }

  getChatMessages(chatId: number): Observable<ApiHistoricalMessage[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    
    return this.http.get<GetMessageApiResponse>(`${this.apiUrl}/Get-Message/${chatId}`, { headers }).pipe(
      map(response => response.data || []), // Ensure data is an array, default to empty if null
      catchError((error: HttpErrorResponse) => {
        // If it's a 404 and the message indicates no history, return an empty array
        if (error.status === 404 && error.error && error.error.message === "No chat history found.") {
          console.warn(`Chat ID ${chatId} has no messages yet. Returning empty array.`);
          return of([]); // Return an empty array observable
        }
        // For other errors, re-throw the error
        return throwError(() => new Error(`Error fetching chat messages for ID ${chatId}: ${error.message}`));
      })
    );
  }
}
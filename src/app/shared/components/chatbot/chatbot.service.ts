import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface N8nResponse {
  output: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private readonly webhookUrl =
    'https://n8n-plattform-dev.pandero.com.pe/webhook/8cdfe178-0d6c-4f16-bab5-86e89245a059/chat';

  // Sesión persistente durante la visita del usuario
  private sessionId: string = this.generateSessionId();

  constructor(private http: HttpClient) {}

  sendMessage(userMessage: string): Observable<N8nResponse> {
    const body = {
      chatInput: userMessage,
      sessionId: this.sessionId,
    };
    return this.http.post<N8nResponse>(this.webhookUrl, body);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

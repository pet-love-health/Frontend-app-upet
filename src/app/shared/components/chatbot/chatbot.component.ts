import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from './chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ChatbotService],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  userInput = '';
  messages: ChatMessage[] = [];

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit(): void {
    // Mensaje de bienvenida
    this.messages.push({
      role: 'bot',
      content: '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    // Agrega mensaje del usuario
    this.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    this.userInput = '';
    this.isLoading = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'bot',
          content: response.output || 'No pude procesar tu mensaje.',
          timestamp: new Date(),
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al llamar al webhook:', err);
        this.messages.push({
          role: 'bot',
          content: 'Ocurrió un error. Por favor intenta de nuevo.',
          timestamp: new Date(),
        });
        this.isLoading = false;
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}

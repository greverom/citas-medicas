import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface WhatsAppPayload {
  phone: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private base = environment.apiWhatsapp; 

  constructor(private http: HttpClient) {}

  // Convierte 09XXXXXXXX | 5939XXXXXXX | +5939XXXXXXX -> +5939XXXXXXX
  toWhatsAppIntl(raw: string): string {
    const digits = String(raw ?? '').replace(/\D/g, '');
    const m = digits.match(/^(?:593)?0?(\d{9})$/);
    return m ? `+593${m[1]}` : `+${digits}`;
  }

  // POST /whatsapp/send
  sendMessage(payload: WhatsAppPayload): Observable<any> {
    const phoneIntl = this.toWhatsAppIntl(payload.phone);
    const body = { ...payload, phone: phoneIntl };

    console.log('[WA] Enviando body al backend:', body);

    return this.http.post(`${this.base}/whatsapp/send`, body);
  }
}
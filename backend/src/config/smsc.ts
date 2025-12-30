import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface SmscResponse {
  id: number;
  cnt: number;
  cost: string;
 balance: string;
}

export class SMSCService {
  private readonly login: string;
  private readonly password: string;
  private readonly sender: string;

  constructor() {
    this.login = process.env.SMSC_LOGIN || '';
    this.password = process.env.SMSC_PASSWORD || '';
    this.sender = process.env.SMSC_SENDER || 'TelegramApp';
  }

  async sendSMS(phone: string, message: string): Promise<SmscResponse> {
    const params = {
      login: this.login,
      psw: this.password,
      phones: phone.replace(/\D/g, ''),
      mes: message,
      sender: this.sender,
      fmt: 3, // JSON response
    };

    try {
      const response = await axios.get('https://smsc.ru/sys/send.php', { params });
      return response.data;
    } catch (error) {
      console.error('SMSC Error:', error);
      throw error;
    }
  }
}
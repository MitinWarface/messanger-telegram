import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface SmsLog {
  id: string;
  phone_number: string;
  message: string;
  sms_id?: string;
  status: string;
  sent_by?: string;
  created_at: Date;
}

export class SmsLogModel {
  static async create(
    phone_number: string,
    message: string,
    sms_id?: string,
    status: string = 'sent',
    sent_by?: string
  ): Promise<SmsLog> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO sms_logs (id, phone_number, message, sms_id, status, sent_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [id, phone_number, message, sms_id, status, sent_by]);
    return rows[0];
  }

  static async findByPhoneNumber(phone_number: string): Promise<SmsLog[]> {
    const query = 'SELECT * FROM sms_logs WHERE phone_number = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [phone_number]);
    return rows;
  }

  static async findAll(): Promise<SmsLog[]> {
    const query = 'SELECT * FROM sms_logs ORDER BY created_at DESC LIMIT 100';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    const query = 'UPDATE sms_logs SET status = $1 WHERE id = $2';
    await pool.query(query, [status, id]);
  }
}
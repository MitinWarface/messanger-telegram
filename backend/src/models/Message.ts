import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content?: string;
  file_type?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  is_edited: boolean;
  created_at: Date;
}

export class MessageModel {
  static async create(
    chat_id: string,
    sender_id: string,
    content?: string,
    file_type?: string,
    file_url?: string,
    file_name?: string,
    file_size?: number,
    mime_type?: string
  ): Promise<Message> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO messages (id, chat_id, sender_id, content, file_type, file_url, file_name, file_size, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      id, chat_id, sender_id, content, file_type, file_url, file_name, file_size, mime_type
    ]);
    return rows[0];
  }

  static async findByChatId(chat_id: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE chat_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const { rows } = await pool.query(query, [chat_id, limit, offset]);
    return rows;
  }

  static async findById(id: string): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async updateContent(id: string, content: string): Promise<Message> {
    const query = 'UPDATE messages SET content = $1, is_edited = true WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(query, [content, id]);
    return rows[0];
  }

  static async deleteMessage(id: string): Promise<void> {
    const query = 'DELETE FROM messages WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getRecentMessages(limit: number = 20): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }
}
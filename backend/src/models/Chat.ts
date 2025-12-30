import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  title?: string;
  avatar_url?: string;
  created_by?: string;
  created_at: Date;
}

export interface ChatUser {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: Date;
}

export class ChatModel {
  static async create(type: 'private' | 'group' | 'channel', title?: string, created_by?: string): Promise<Chat> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO chats (id, type, title, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [id, type, title, created_by]);
    return rows[0];
  }

  static async findById(id: string): Promise<Chat | null> {
    const query = 'SELECT * FROM chats WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async findAll(): Promise<Chat[]> {
    const query = 'SELECT * FROM chats ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async addUserToChat(chat_id: string, user_id: string, role: 'admin' | 'member' = 'member'): Promise<void> {
    const query = `
      INSERT INTO chat_users (id, chat_id, user_id, role)
      VALUES ($1, $2, $3, $4)
    `;
    
    await pool.query(query, [uuidv4(), chat_id, user_id, role]);
  }

  static async getUserChats(user_id: string): Promise<Chat[]> {
    const query = `
      SELECT c.* 
      FROM chats c
      JOIN chat_users cu ON c.id = cu.chat_id
      WHERE cu.user_id = $1
      ORDER BY c.created_at DESC
    `;
    
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  static async getChatUsers(chat_id: string): Promise<ChatUser[]> {
    const query = 'SELECT * FROM chat_users WHERE chat_id = $1';
    const { rows } = await pool.query(query, [chat_id]);
    return rows;
  }

  static async updateChatTitle(chat_id: string, title: string): Promise<Chat> {
    const query = 'UPDATE chats SET title = $1 WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(query, [title, chat_id]);
    return rows[0];
  }

  static async deleteChat(chat_id: string): Promise<void> {
    const query = 'DELETE FROM chats WHERE id = $1';
    await pool.query(query, [chat_id]);
  }
}
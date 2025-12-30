import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_banned: boolean;
  is_online: boolean;
  last_seen: Date;
  created_at: Date;
}

export class UserModel {
  static async create(phone_number: string, first_name?: string, last_name?: string): Promise<User> {
    const id = uuidv4();
    const is_admin = phone_number === '+79918816358';
    
    const query = `
      INSERT INTO users (id, phone_number, first_name, last_name, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [id, phone_number, first_name, last_name, is_admin]);
    return rows[0];
  }

  static async findByPhoneNumber(phone_number: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE phone_number = $1';
    const { rows } = await pool.query(query, [phone_number]);
    return rows.length ? rows[0] : null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
  }

  static async updateOnlineStatus(id: string, is_online: boolean): Promise<void> {
    const query = 'UPDATE users SET is_online = $1, last_seen = NOW() WHERE id = $2';
    await pool.query(query, [is_online, id]);
  }

  static async findAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async updateProfile(id: string, profileData: { first_name?: string; last_name?: string; avatar_url?: string }): Promise<User> {
    const { first_name, last_name, avatar_url } = profileData;
    const query = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name), 
          last_name = COALESCE($2, last_name), 
          avatar_url = COALESCE($3, avatar_url)
      WHERE id = $4
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [first_name, last_name, avatar_url, id]);
    return rows[0];
  }

  static async banUser(id: string): Promise<void> {
    const query = 'UPDATE users SET is_banned = true WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async unbanUser(id: string): Promise<void> {
    const query = 'UPDATE users SET is_banned = false WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getAdminUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE is_admin = true';
    const { rows } = await pool.query(query);
    return rows;
  }
}
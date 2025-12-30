import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class AdminActionModel {
  static async create(
    admin_id: string,
    action_type: string,
    target_id?: string,
    ip_address?: string,
    user_agent?: string
  ): Promise<AdminAction> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO admin_actions (id, admin_id, action_type, target_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [id, admin_id, action_type, target_id, ip_address, user_agent]);
    return rows[0];
  }

  static async findByAdminId(admin_id: string): Promise<AdminAction[]> {
    const query = 'SELECT * FROM admin_actions WHERE admin_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [admin_id]);
    return rows;
  }

  static async findByActionType(action_type: string): Promise<AdminAction[]> {
    const query = 'SELECT * FROM admin_actions WHERE action_type = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(query, [action_type]);
    return rows;
  }

  static async findAll(): Promise<AdminAction[]> {
    const query = 'SELECT * FROM admin_actions ORDER BY created_at DESC LIMIT 100';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getAdminStats(): Promise<{
    totalActions: number;
    actionsByType: { type: string; count: number }[];
    recentActions: AdminAction[];
  }> {
    // Total actions
    const totalQuery = 'SELECT COUNT(*) as count FROM admin_actions';
    const totalResult = await pool.query(totalQuery);
    const totalActions = parseInt(totalResult.rows[0].count);

    // Actions by type
    const typeQuery = `
      SELECT action_type as type, COUNT(*) as count 
      FROM admin_actions 
      GROUP BY action_type 
      ORDER BY count DESC
    `;
    const typeResult = await pool.query(typeQuery);
    const actionsByType = typeResult.rows;

    // Recent actions
    const recentQuery = 'SELECT * FROM admin_actions ORDER BY created_at DESC LIMIT 10';
    const recentResult = await pool.query(recentQuery);
    const recentActions = recentResult.rows;

    return { totalActions, actionsByType, recentActions };
  }
}
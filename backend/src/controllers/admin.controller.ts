import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { MessageModel } from '../models/Message.js';
import { ChatModel } from '../models/Chat.js';
import { SmsLogModel } from '../models/SmsLog.js';
import { AdminActionModel } from '../models/AdminAction.js';
import { AuthService } from '../services/auth.service.js';

export class AdminController {
  public authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Get admin dashboard stats
 async getDashboardStats(req: Request, res: Response) {
    try {
      // Get user stats
      const totalUsers = await UserModel.findAll();
      const activeUsers = totalUsers.filter(user => user.is_online);
      const bannedUsers = totalUsers.filter(user => user.is_banned);
      const adminUsers = totalUsers.filter(user => user.is_admin);

      // Get message stats
      const recentMessages = await MessageModel.getRecentMessages(20);

      // Get admin actions stats
      const adminStats = await AdminActionModel.getAdminStats();

      // Get recent SMS logs
      const recentSmsLogs = await SmsLogModel.findAll();

      res.json({
        users: {
          total: totalUsers.length,
          active: activeUsers.length,
          banned: bannedUsers.length,
          admin: adminUsers.length,
        },
        messages: {
          recent: recentMessages.length,
        },
        admin: adminStats,
        sms: {
          recent: recentSmsLogs.slice(0, 10),
        },
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
 }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
      return;
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Ban user
async banUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUser = (req as any).user;
      
      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Ban the user
      await UserModel.banUser(id);
      
      // Log admin action
      await AdminActionModel.create(
        adminUser.id,
        'user_banned',
        id,
        req.ip,
        req.get('User-Agent')
      );
      
      res.json({ message: 'User banned successfully', user: { ...user, is_banned: true } });
      return;
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Unban user
  async unbanUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminUser = (req as any).user;
      
      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Unban the user
      await UserModel.unbanUser(id);
      
      // Log admin action
      await AdminActionModel.create(
        adminUser.id,
        'user_unbanned',
        id,
        req.ip,
        req.get('User-Agent')
      );
      
      res.json({ message: 'User unbanned successfully', user: { ...user, is_banned: false } });
      return;
    } catch (error) {
      console.error('Error unbanning user:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get all chats
  async getAllChats(req: Request, res: Response) {
    try {
      const chats = await ChatModel.findAll();
      res.json(chats);
    } catch (error) {
      console.error('Error getting chats:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get chat by ID
  async getChatById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const chat = await ChatModel.findById(id);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      
      // Get chat users
      const chatUsers = await ChatModel.getChatUsers(id);
      
      // Get recent messages
      const messages = await MessageModel.findByChatId(id, 50, 0);
      
      res.json({
        ...chat,
        users: chatUsers,
        messages,
      });
      return;
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get all messages
  async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await MessageModel.getRecentMessages(100);
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get all SMS logs
  async getSmsLogs(req: Request, res: Response) {
    try {
      const logs = await SmsLogModel.findAll();
      res.json(logs);
    } catch (error) {
      console.error('Error getting SMS logs:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
 }

  // Get admin actions
  async getAdminActions(req: Request, res: Response) {
    try {
      const actions = await AdminActionModel.findAll();
      res.json(actions);
    } catch (error) {
      console.error('Error getting admin actions:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Send broadcast message
  async sendBroadcastMessage(req: Request, res: Response) {
    try {
      const { message, target } = req.body;
      const adminUser = (req as any).user;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Log admin action
      await AdminActionModel.create(
        adminUser.id,
        'broadcast_message',
        undefined,
        req.ip,
        req.get('User-Agent')
      );
      
      // In a real implementation, this would send the message to all users or specific target
      // For now, just return success
      res.json({ message: 'Broadcast message sent successfully' });
      return;
    } catch (error) {
      console.error('Error sending broadcast message:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }
}

// Helper to create all admin routes
export function setupAdminRoutes(app: any) {
  const controller = new AdminController();
  
  // Dashboard stats
  app.get('/api/admin/dashboard', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getDashboardStats(req, res));
  
  // Users management
  app.get('/api/admin/users', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getAllUsers(req, res));
  app.get('/api/admin/users/:id', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getUserById(req, res));
  app.post('/api/admin/users/:id/ban', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.banUser(req, res));
  app.post('/api/admin/users/:id/unban', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.unbanUser(req, res));
  
  // Chats management
 app.get('/api/admin/chats', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getAllChats(req, res));
  app.get('/api/admin/chats/:id', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getChatById(req, res));
  
  // Messages management
  app.get('/api/admin/messages', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getAllMessages(req, res));
  
  // SMS logs
  app.get('/api/admin/sms-logs', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getSmsLogs(req, res));
  
  // Admin actions
  app.get('/api/admin/actions', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.getAdminActions(req, res));
  
  // Broadcast message
  app.post('/api/admin/broadcast', controller.authService.authenticateAdmin, (req: Request, res: Response) => controller.sendBroadcastMessage(req, res));
}
import { Request, Response } from 'express';
import { ChatModel } from '../models/Chat.js';
import { MessageModel } from '../models/Message.js';
import { UserModel } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { FileUploadService } from '../services/fileUpload.service.js';

interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export class ChatController {
  public fileUploadService: FileUploadService;

  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  // Create a new chat
 async createChat(req: Request, res: Response) {
    try {
      const { type, title, userIds } = req.body;
      const user = (req as any).user;

      if (!type || !['private', 'group', 'channel'].includes(type)) {
        return res.status(400).json({ error: 'Valid chat type is required (private, group, channel)' });
      }

      // For private chats, there should be only one other user
      if (type === 'private' && (!userIds || userIds.length !== 1)) {
        return res.status(400).json({ error: 'Private chat requires exactly one other user' });
      }

      // Create the chat
      const chat = await ChatModel.create(type, title, user.id);

      // Add the creator to the chat as admin for groups/channels, member for private
      await ChatModel.addUserToChat(chat.id, user.id, type === 'private' ? 'member' : 'admin');

      // Add other users if it's a group/channel
      if (userIds && type !== 'private') {
        for (const userId of userIds) {
          await ChatModel.addUserToChat(chat.id, userId, 'member');
        }
      } else if (type === 'private' && userIds) {
        // Add the other user for private chat
        await ChatModel.addUserToChat(chat.id, userIds[0], 'member');
      }

      res.status(201).json(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's chats
  async getUserChats(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const chats = await ChatModel.getUserChats(user.id);
      res.json(chats);
    } catch (error) {
      console.error('Error getting user chats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get chat by ID
  async getChatById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const chat = await ChatModel.findById(id);
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if user is part of the chat
      const chatUsers = await ChatModel.getChatUsers(id);
      const isUserInChat = chatUsers.some(chatUser => chatUser.user_id === user.id);
      
      if (!isUserInChat) {
        return res.status(403).json({ error: 'User is not part of this chat' });
      }

      res.json({
        ...chat,
        users: chatUsers
      });
    } catch (error) {
      console.error('Error getting chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get chat messages
  async getChatMessages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const user = (req as any).user;

      // Check if user is part of the chat
      const chatUsers = await ChatModel.getChatUsers(id);
      const isUserInChat = chatUsers.some(chatUser => chatUser.user_id === user.id);
      
      if (!isUserInChat) {
        return res.status(403).json({ error: 'User is not part of this chat' });
      }

      const messages = await MessageModel.findByChatId(id, parseInt(limit as string), parseInt(offset as string));
      res.json(messages);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send message to chat
 async sendMessage(req: Request, res: Response) {
    try {
      const { chatId, content, file_type, file_url, file_name, file_size, mime_type } = req.body;
      const user = (req as any).user;

      if (!chatId || (!content && !file_url)) {
        return res.status(400).json({ error: 'Chat ID and message content or file are required' });
      }

      // Check if user is part of the chat
      const chatUsers = await ChatModel.getChatUsers(chatId);
      const isUserInChat = chatUsers.some(chatUser => chatUser.user_id === user.id);
      
      if (!isUserInChat) {
        return res.status(403).json({ error: 'User is not part of this chat' });
      }

      const message = await MessageModel.create(
        chatId,
        user.id,
        content,
        file_type,
        file_url,
        file_name,
        file_size,
        mime_type
      );

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Send message with file upload
 async sendMessageWithFile(req: FileUploadRequest, res: Response) {
    try {
      const { chatId } = req.body;
      const user = (req as any).user;

      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }

      // Upload file
      const uploadResult = await this.fileUploadService.uploadFile(req, 'media');

      // Create message with file
      const message = await MessageModel.create(
        chatId,
        user.id,
        req.body.content || '',
        uploadResult.mimeType.startsWith('image/') ? 'image' : 
        uploadResult.mimeType.startsWith('video/') ? 'video' : 'document',
        uploadResult.url,
        uploadResult.originalName,
        uploadResult.size,
        uploadResult.mimeType
      );

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message with file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update message
  async updateMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user = (req as any).user;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const message = await MessageModel.findById(id);
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.sender_id !== user.id) {
        return res.status(403).json({ error: 'User can only update their own messages' });
      }

      const updatedMessage = await MessageModel.updateContent(id, content);
      res.json(updatedMessage);
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete message
 async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const message = await MessageModel.findById(id);
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Check if user is the sender or an admin of the chat
      if (message.sender_id !== user.id) {
        // Check if user is an admin of the chat
        const chatUsers = await ChatModel.getChatUsers(message.chat_id);
        const userRole = chatUsers.find(chatUser => chatUser.user_id === user.id)?.role;
        
        if (userRole !== 'admin') {
          return res.status(403).json({ error: 'User can only delete their own messages or if they are an admin' });
        }
      }

      await MessageModel.deleteMessage(id);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Add user to chat
  async addUserToChat(req: Request, res: Response) {
    try {
      const { chatId, userId } = req.body;
      const user = (req as any).user;

      if (!chatId || !userId) {
        return res.status(400).json({ error: 'Chat ID and User ID are required' });
      }

      // Check if the requester is an admin of the chat
      const chatUsers = await ChatModel.getChatUsers(chatId);
      const requesterRole = chatUsers.find(chatUser => chatUser.user_id === user.id)?.role;
      
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can add users to chat' });
      }

      // Add user to chat
      await ChatModel.addUserToChat(chatId, userId, 'member');
      res.json({ message: 'User added to chat successfully' });
    } catch (error) {
      console.error('Error adding user to chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Remove user from chat
  async removeUserFromChat(req: Request, res: Response) {
    try {
      const { chatId, userId } = req.body;
      const user = (req as any).user;

      if (!chatId || !userId) {
        return res.status(400).json({ error: 'Chat ID and User ID are required' });
      }

      // Check if the requester is an admin of the chat
      const chatUsers = await ChatModel.getChatUsers(chatId);
      const requesterRole = chatUsers.find(chatUser => chatUser.user_id === user.id)?.role;
      
      if (requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can remove users from chat' });
      }

      // Check if the user to be removed is an admin (admins cannot remove other admins)
      const userToRemoveRole = chatUsers.find(chatUser => chatUser.user_id === userId)?.role;
      if (userToRemoveRole === 'admin' && user.id !== userId) {
        return res.status(403).json({ error: 'Admins cannot remove other admins' });
      }

      // For private chats, removing a user effectively deletes the chat for that user
      const chat = await ChatModel.findById(chatId);
      if (chat?.type === 'private') {
        // In a private chat, if one user leaves, the chat becomes inactive for them
        // For simplicity, we'll just remove the user from the chat_users table
      }

      // Remove user from chat
      // Note: In a real implementation, you might want to handle this differently for private chats
      const removeQuery = 'DELETE FROM chat_users WHERE chat_id = $1 AND user_id = $2';
      await pool.query(removeQuery, [chatId, userId]);
      
      res.json({ message: 'User removed from chat successfully' });
    } catch (error) {
      console.error('Error removing user from chat:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Helper to create all chat routes
export function setupChatRoutes(app: any) {
  const controller = new ChatController();
  
  // Chat management
  app.post('/api/chats', (req: Request, res: Response) => controller.createChat(req, res));
  app.get('/api/chats', (req: Request, res: Response) => controller.getUserChats(req, res));
  app.get('/api/chats/:id', (req: Request, res: Response) => controller.getChatById(req, res));
  
  // Messages management
  app.get('/api/chats/:id/messages', (req: Request, res: Response) => controller.getChatMessages(req, res));
  app.post('/api/chats/:id/messages', (req: Request, res: Response) => controller.sendMessage(req, res));
  app.post('/api/chats/:id/messages/upload', controller.fileUploadService.singleUpload, (req: Request, res: Response) => controller.sendMessageWithFile(req as FileUploadRequest, res));
  app.put('/api/messages/:id', (req: Request, res: Response) => controller.updateMessage(req, res));
  app.delete('/api/messages/:id', (req: Request, res: Response) => controller.deleteMessage(req, res));
  
  // Chat user management
 app.post('/api/chats/:id/add-user', (req: Request, res: Response) => controller.addUserToChat(req, res));
  app.post('/api/chats/:id/remove-user', (req: Request, res: Response) => controller.removeUserFromChat(req, res));
}
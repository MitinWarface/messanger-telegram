import { Server, Socket } from 'socket.io';
import { MessageModel } from '../models/Message.js';
import { ChatModel } from '../models/Chat.js';
import { UserModel } from '../models/User.js';
import { AuthService } from '../services/auth.service.js';

export class ChatSocketHandlers {
  private authService: AuthService;

  constructor(private io: Server) {
    this.authService = new AuthService();
  }

  async setupSocketHandlers(socket: Socket) {
    // Authentication middleware for socket
    socket.use(async (packet, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const user = await this.authService.getUserFromToken(token);
        if (!user) {
          return next(new Error('Invalid token'));
        }
        
        if (user.is_banned) {
          return next(new Error('User is banned'));
        }
        
        // Attach user to socket
        (socket as any).user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Handle connection
    socket.on('connect', () => {
      const user = (socket as any).user;
      console.log(`User connected: ${user.phone_number} (${user.id})`);
      
      // Update user online status
      UserModel.updateOnlineStatus(user.id, true);
      
      // Join user's own room
      socket.join(`user:${user.id}`);
      
      // Join admin room if user is admin
      if (user.is_admin) {
        socket.join('admin-room');
        this.io.to('admin-room').emit('admin_online', user.id);
      }
      
      // Notify other users about online status
      this.io.emit('user_online', user.id);
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      const user = (socket as any).user;
      console.log(`User disconnected: ${user.phone_number} (${user.id}) - Reason: ${reason}`);
      
      // Update user online status
      await UserModel.updateOnlineStatus(user.id, false);
      
      // Notify other users about offline status
      this.io.emit('user_offline', user.id);
    });

    // Handle joining chat rooms
    socket.on('join_chat', async (chatId) => {
      const user = (socket as any).user;
      
      try {
        // Verify user is part of the chat
        const chatUsers = await ChatModel.getChatUsers(chatId);
        const isUserInChat = chatUsers.some(chatUser => chatUser.user_id === user.id);
        
        if (!isUserInChat) {
          socket.emit('error', { message: 'User is not part of this chat' });
          return;
        }
        
        // Join chat room
        socket.join(`chat:${chatId}`);
        socket.emit('joined_chat', chatId);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.emit('left_chat', chatId);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      const user = (socket as any).user;
      
      try {
        const { chatId, content, file_type, file_url, file_name, file_size, mime_type } = data;
        
        if (!chatId || (!content && !file_url)) {
          socket.emit('error', { message: 'Chat ID and message content or file are required' });
          return;
        }

        // Verify user is part of the chat
        const chatUsers = await ChatModel.getChatUsers(chatId);
        const isUserInChat = chatUsers.some(chatUser => chatUser.user_id === user.id);
        
        if (!isUserInChat) {
          socket.emit('error', { message: 'User is not part of this chat' });
          return;
        }

        // Create message in database
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

        // Broadcast message to chat room
        this.io.to(`chat:${chatId}`).emit('new_message', message);
        
        // If this is an admin message, also send to admin room
        if (user.is_admin) {
          this.io.to('admin-room').emit('admin_new_message', message);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const user = (socket as any).user;
      const { chatId } = data;
      
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: user.id,
        chatId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const user = (socket as any).user;
      const { chatId } = data;
      
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: user.id,
        chatId,
        isTyping: false
      });
    });

    // Handle read receipts
    socket.on('message_read', async (data) => {
      const user = (socket as any).user;
      const { messageId } = data;
      
      // In a real implementation, you would update the message read status in the database
      // For now, just emit an event to the sender
      try {
        const message = await MessageModel.findById(messageId);
        if (message) {
          this.io.to(`user:${message.sender_id}`).emit('message_read', {
            messageId,
            readerId: user.id,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error handling read receipt:', error);
      }
    });

    // Admin-specific events
    socket.on('admin_broadcast', (data) => {
      const user = (socket as any).user;
      
      if (!user.is_admin) {
        socket.emit('error', { message: 'Admin access required' });
        return;
      }
      
      // Broadcast message to all users
      this.io.emit('admin_broadcast', {
        ...data,
        sender: user,
        timestamp: new Date()
      });
    });

    socket.on('admin_user_banned', (data) => {
      const user = (socket as any).user;
      
      if (!user.is_admin) {
        socket.emit('error', { message: 'Admin access required' });
        return;
      }
      
      // Notify affected user and all clients
      this.io.to(`user:${data.userId}`).emit('user_banned', data);
      this.io.emit('admin_user_banned', data);
    });

    socket.on('admin_user_unbanned', (data) => {
      const user = (socket as any).user;
      
      if (!user.is_admin) {
        socket.emit('error', { message: 'Admin access required' });
        return;
      }
      
      // Notify affected user and all clients
      this.io.to(`user:${data.userId}`).emit('user_unbanned', data);
      this.io.emit('admin_user_unbanned', data);
    });
  }
}
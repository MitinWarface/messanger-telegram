import { Request } from 'express';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel, User } from '../models/User.js';
import { SMSCService } from '../config/smsc.js';
import redisClient from '../config/redis.js';
import { SmsLogModel } from '../models/SmsLog.js';

export interface AuthResponse {
  user: User;
  token: string;
 refreshToken: string;
}

export class AuthService {
  private smscService: SMSCService;
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly smsCodeTTL: number;

  constructor() {
    this.smscService = new SMSCService();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret';
    this.smsCodeTTL = parseInt(process.env.SMS_CODE_TTL || '300'); // 5 minutes default
  }

  async sendSMSCode(phone: string): Promise<boolean> {
    // Generate a random 6-digit code
    const code = Math.floor(1000 + Math.random() * 900000).toString();
    
    try {
      // Store the code in Redis with TTL
      await redisClient.setEx(`sms_code:${phone}`, this.smsCodeTTL, code);
      
      // Send SMS via SMSC.RU
      const message = `Код для Telegram Clone: ${code}`;
      const smsResponse = await this.smscService.sendSMS(phone, message);
      
      // Log the SMS for admin panel
      await SmsLogModel.create(
        phone,
        `Код: ${code}`,
        smsResponse.id?.toString(),
        'sent'
      );
      
      console.log(`SMS code sent to ${phone}: ${code}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS code:', error);
      
      // Log failed SMS for admin panel
      await SmsLogModel.create(
        phone,
        `Код: ${code} (failed)`,
        undefined,
        'failed'
      );
      
      return false;
    }
  }

 async verifySMSCode(phone: string, code: string): Promise<boolean> {
    try {
      const storedCode = await redisClient.get(`sms_code:${phone}`);
      
      if (storedCode && storedCode === code) {
        // Delete the code after successful verification
        await redisClient.del(`sms_code:${phone}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      return false;
    }
  }

  async registerUser(phone: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    // Check if user already exists
    let user = await UserModel.findByPhoneNumber(phone);
    
    if (user) {
      // Update user info if needed
      if (firstName || lastName) {
        user = await UserModel.updateProfile(user.id, { first_name: firstName, last_name: lastName });
      }
    } else {
      // Create new user
      user = await UserModel.create(phone, firstName, lastName);
    }
    
    // Generate JWT tokens
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number, isAdmin: user.is_admin },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      this.jwtRefreshSecret,
      { expiresIn: '30d' }
    );
    
    return { user, token, refreshToken };
  }

  async authenticateUser(phone: string, code: string): Promise<AuthResponse | null> {
    // Verify the SMS code
    const isValidCode = await this.verifySMSCode(phone, code);
    
    if (!isValidCode) {
      return null;
    }
    
    // Register or get existing user
    return await this.registerUser(phone);
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string };
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        return null;
      }
      
      return jwt.sign(
        { userId: user.id, phoneNumber: user.phone_number, isAdmin: user.is_admin },
        this.jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

 async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return await UserModel.findById(decoded.userId);
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

 async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Middleware for protecting routes
  authenticateToken = async (req: Request, _res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new Error('Access token required'));
    }

    try {
      const user = await this.getUserFromToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }
      
      // Check if user is banned
      if (user.is_banned) {
        return next(new Error('User is banned'));
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };

  // Middleware for admin-only routes
  authenticateAdmin = async (req: Request, _res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new Error('Access token required'));
    }

    try {
      const user = await this.getUserFromToken(token);
      if (!user) {
        return next(new Error('Invalid token'));
      }
      
      if (!user.is_admin) {
        return next(new Error('Admin access required'));
      }
      
      (req as any).user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
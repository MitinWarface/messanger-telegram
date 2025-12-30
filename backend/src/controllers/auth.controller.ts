import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UserModel } from '../models/User.js';

export class AuthController {
  public authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async sendSMSCode(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const success = await this.authService.sendSMSCode(phone);
      
      if (success) {
        res.json({ message: 'SMS code sent successfully' });
      } else {
        res.status(500).json({ error: 'Failed to send SMS code' });
      }
    } catch (error) {
      console.error('Error sending SMS code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verifySMSCode(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({ error: 'Phone number and code are required' });
      }

      const authResult = await this.authService.authenticateUser(phone, code);
      
      if (authResult) {
        res.json({
          message: 'Authentication successful',
          user: authResult.user,
          token: authResult.token,
          refreshToken: authResult.refreshToken
        });
      } else {
        res.status(401).json({ error: 'Invalid SMS code' });
      }
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const newToken = await this.authService.refreshAccessToken(refreshToken);
      
      if (newToken) {
        res.json({ token: newToken });
      } else {
        res.status(401).json({ error: 'Invalid refresh token' });
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { firstName, lastName, avatar_url } = req.body;
      
      if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const updatedUser = await UserModel.updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        avatar_url
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Helper to create all auth routes
export function setupAuthRoutes(app: any) {
  const controller = new AuthController();
  
  // SMS authentication
  app.post('/api/auth/send-code', (req: Request, res: Response) => controller.sendSMSCode(req, res));
  app.post('/api/auth/verify-code', (req: Request, res: Response) => controller.verifySMSCode(req, res));
  app.post('/api/auth/refresh', (req: Request, res: Response) => controller.refreshToken(req, res));
  
  // User profile
  app.get('/api/auth/profile', controller.authService.authenticateToken, (req: Request, res: Response) => controller.getUserProfile(req, res));
  app.put('/api/auth/profile', controller.authService.authenticateToken, (req: Request, res: Response) => controller.updateUserProfile(req, res));
}
import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, rememberMe } = req.body;
      const result = await authService.login(email, password, rememberMe);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const result = await authService.getAllUsers(page, limit);
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { role, isActive } = req.body;
      const result = await authService.updateUserRole(id, role, isActive);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await authService.deleteUser(id);
      res.json({ success: true, message: 'User deactivated.' });
    } catch (error) { next(error); }
  }
}

export const authController = new AuthController();

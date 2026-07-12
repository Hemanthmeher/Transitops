import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { AppError } from '../utils/errors';
import { JwtPayload } from '../types';
import { generateResetToken } from '../utils/helpers';

export class AuthService {
  async register(data: { email: string; password: string; name: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('A user with this email already exists.', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: (data.role as any) || 'DISPATCHER',
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    const token = this.generateToken(user.id, user.email, user.role as any, false);

    return { user, token };
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = this.generateToken(user.id, user.email, user.role, rememberMe);

    // If remember me, store the token
    if (rememberMe) {
      await prisma.user.update({
        where: { id: user.id },
        data: { rememberToken: token },
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      token,
      rememberMe,
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = generateResetToken();
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // In production, send email via nodemailer
    const resetUrl = `${config.appUrl}/reset-password?token=${resetToken}`;
    console.log(`📧 Password reset URL: ${resetUrl}`);

    return { message: 'If the email exists, a reset link has been sent.', resetUrl };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { message: 'Password reset successful. You can now log in.' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError('Current password is incorrect.', 400);

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully.' };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: number, role: string, isActive?: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    return prisma.user.update({
      where: { id: userId },
      data: { role: role as any, ...(isActive !== undefined && { isActive }) },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
  }

  async deleteUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);
    return prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }

  private generateToken(userId: number, email: string, role: string, rememberMe: boolean): string {
    const payload: JwtPayload = { userId, email, role: role as any };
    const expiresIn = rememberMe ? config.jwt.rememberMeExpiresIn : config.jwt.expiresIn;
    return jwt.sign(payload, config.jwt.secret, { expiresIn } as any);
  }
}

export const authService = new AuthService();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { JwtPayload } from '../types';

export class AuthService {
  async register(data: { email: string; password: string; name: string; role?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: (data.role as any) || 'DISPATCHER',
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedError('Account is deactivated');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  private generateToken(user: { id: number; email: string; role: string }): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as any,
    };
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any);
  }
}

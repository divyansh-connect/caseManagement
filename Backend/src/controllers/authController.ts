import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6)
});

export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Validation Failed', details: result.error.errors });
  }

  const { email, password } = result.data;

  try {
    // Check if user exists. If not, auto-seed default admin credentials
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user && email === 'admin@babelglobal.com') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = await prisma.user.create({
        data: {
          name: 'Case Administrator',
          email,
          password: hashedPassword,
          role: 'admin'
        }
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super-secret-jwt-key-replace-this',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { RegisterAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AccountNumberGenerator } from 'src/common/utils/account-number.generator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accountNumberGenerator: AccountNumberGenerator,
  ) {}

  async create(registerAuthDto: RegisterAuthDto, response: Response) {
    if (!registerAuthDto.email || !registerAuthDto.password || !registerAuthDto.name || !registerAuthDto.surname) {
      throw new BadRequestException('Missing required fields');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerAuthDto.email,
        name: registerAuthDto.name,
        surname: registerAuthDto.surname,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        createdAt: true,
      },
    });

    await this.prisma.bankAccount.create({
      data: {
        userId: user.id,
        accountNumber: await this.accountNumberGenerator.generateUniqueAccountNumber(),
        balance: 0,
      },
    });


    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    // Set token in cookie
    this.setTokenCookie(response, token);

    return {
      message: 'User registered successfully',
      user,
      accessToken: token,
    };
  }

  async login(loginAuthDto: LoginAuthDto, response: Response) {
    if (!loginAuthDto.email || !loginAuthDto.password) {
      throw new BadRequestException('Missing required fields');
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(loginAuthDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    // Set token in cookie
    this.setTokenCookie(response, token);

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async logout(response: Response) {
    // Clear the access token cookie
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      message: 'Logout successful',
    };
  }

  private generateToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private setTokenCookie(response: Response, token: string): void {
    response.cookie('access_token', token, {
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/',
    });
  }
}
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prismaService: PrismaService,
  ) {}

  @Post("/register")
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with email, password, name and surname. Sets access token in httpOnly cookie.'
  })
  @ApiBody({ 
    type: RegisterAuthDto,
    description: 'User registration details'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully. Access token set in cookie.',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John',
          surname: 'Doe',
          createdAt: '2025-10-27T10:00:00.000Z'
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Missing required fields' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists' 
  })
  create(
    @Body() registerAuthDto: RegisterAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.create(registerAuthDto, response);
  }

  @Post("/login")
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticates a user with email and password. Sets access token in httpOnly cookie.'
  })
  @ApiBody({ 
    type: LoginAuthDto,
    description: 'User login credentials'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful. Access token set in cookie.',
    schema: {
      example: {
        message: 'Login successful',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John',
          surname: 'Doe',
          createdAt: '2025-10-27T10:00:00.000Z'
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Missing required fields' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginAuthDto, response);
  }

  @Post("/logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logs out the current user by clearing the access token cookie'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logout successful'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Get("/profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the profile of the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        name: 'John',
        surname: 'Doe',
        createdAt: '2025-10-27T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  getProfile(@Request() req) {
    return req.user;
  }
}
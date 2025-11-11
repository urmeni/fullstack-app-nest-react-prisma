import { Controller, Body, Post, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: { email: string; password: string; name?: string }) {
    return this.authService.signup(body.email, body.password, body.name);
  }
  @Post('signin')
  signin(@Body() body: { email: string; password: string }) {
    return this.authService.signin(body.email, body.password);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    // req.user is set by JwtStrategy.validate()
    // Type is any by default; return it safely
    // Remove sensitive fields (we returned only safe fields in JwtStrategy)
    return req.user;
  }
}

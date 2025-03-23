import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Request, 
  UseGuards,
  Logger,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../common/decorators/user-role.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.username}`);
    const result = await this.authService.register(registerDto);
    this.logger.log(`Registration successful for email: ${registerDto.username}`);
    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.username}`);
    // LocalAuthGuard will validate credentials and add user to request
    const result = await this.authService.login(req.user);
    this.logger.log(`Login successful for email: ${loginDto.username}`);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Headers('authorization') authHeader: string) {
    this.logger.log('Logout endpoint called');
    
    // Extract token from Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    
    const token = authHeader.split(' ')[1];
    const userId = req.user.userId;
    
    return this.authService.logout(token, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req, @UserRole() userRole: string | null) {
    this.logger.log(`Profile requested for user: ${req.user.userId} with role: ${userRole}`);
    return {
      ...req.user,
      role: userRole
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin')
  getAdminData(@Request() req) {
    this.logger.log(`Admin data requested by user: ${req.user.userId}`);
    return {
      message: 'This is protected admin data',
      user: req.user
    };
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  async test(@Request() req) {
    const isAuthenticated = req.isAuthenticated?.() || false;
    this.logger.log(`Auth test called, authenticated: ${isAuthenticated}`);
    
    return {
      isAuthenticated: isAuthenticated,
      user: isAuthenticated ? req.user : null
    };
  }
} 
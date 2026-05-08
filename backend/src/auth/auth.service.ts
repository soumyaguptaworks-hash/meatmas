import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// ─── In-memory user store ─────────────────────────────────────────────────────

type AppContext = 'ADMIN' | 'FACTORY' | 'POS';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  appContext: AppContext;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  refreshToken: string | null;
};

const HASHED_PASSWORD = bcrypt.hashSync('changeme', 10);

const USERS: UserRecord[] = [
  { id: '1', email: 'admin@meatmas.com',   name: 'Super Admin',     password: HASHED_PASSWORD, role: 'ADMIN',   appContext: 'ADMIN',   isActive: true, failedLoginAttempts: 0, lockedUntil: null, refreshToken: null },
  { id: '2', email: 'manager@meatmas.com', name: 'Factory Manager', password: HASHED_PASSWORD, role: 'MANAGER', appContext: 'FACTORY', isActive: true, failedLoginAttempts: 0, lockedUntil: null, refreshToken: null },
  { id: '3', email: 'staff@meatmas.com',   name: 'Factory Staff',   password: HASHED_PASSWORD, role: 'STAFF',   appContext: 'FACTORY', isActive: true, failedLoginAttempts: 0, lockedUntil: null, refreshToken: null },
  { id: '4', email: 'cashier@meatmas.com', name: 'POS Cashier',     password: HASHED_PASSWORD, role: 'CASHIER', appContext: 'POS',     isActive: true, failedLoginAttempts: 0, lockedUntil: null, refreshToken: null },
];

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = USERS.find((u) => u.email === dto.email);

    if (!user) {
      await bcrypt.compare('dummy', '$2b$10$dummyhashfortimingprotection000000000000000000');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated. Contact administrator.');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minute(s).`);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        throw new UnauthorizedException('Too many failed attempts. Account locked for 30 minutes.');
      }
      const remaining = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
      throw new UnauthorizedException(`Invalid credentials. ${remaining} attempt(s) remaining.`);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    const accessToken = this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async verifyOtp(_dto: any) {
    throw new UnauthorizedException('OTP authentication is disabled.');
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    const user = USERS.find((u) => u.id === payload.sub);

    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Session invalidated. Please login again.');
    }

    const tokenHash = this.sha256(dto.refreshToken);
    if (tokenHash !== user.refreshToken) {
      throw new UnauthorizedException('Refresh token mismatch. Please login again.');
    }

    return { accessToken: this.issueAccessToken(user) };
  }

  async logout(userId: string) {
    const user = USERS.find((u) => u.id === userId);
    if (user) user.refreshToken = null;
    return { message: 'Logged out successfully.' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private sha256(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private issueAccessToken(user: UserRecord): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role, appContext: user.appContext },
      { secret: this.configService.getOrThrow('JWT_SECRET'), expiresIn: '15m' },
    );
  }

  private async issueRefreshToken(user: UserRecord): Promise<string> {
    const token = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: '7d' },
    );
    user.refreshToken = this.sha256(token);
    return token;
  }
}

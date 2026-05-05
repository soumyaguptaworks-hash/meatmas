import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AppContextGuard } from './guards/app-context.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AppContextGuard],
  exports: [AuthService, JwtAuthGuard, AppContextGuard],
})
export class AuthModule {}

export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { AppContextGuard } from './guards/app-context.guard';
export { CurrentUser } from './decorators/current-user.decorator';
export { RequireAppContext } from './decorators/app-context.decorator';

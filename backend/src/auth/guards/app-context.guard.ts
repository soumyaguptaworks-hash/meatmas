import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { APP_CONTEXT_KEY } from '../decorators/app-context.decorator';

@Injectable()
export class AppContextGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(APP_CONTEXT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!required.includes(user?.appContext)) {
      throw new ForbiddenException(
        `This endpoint is restricted to: ${required.join(', ')} context(s)`,
      );
    }

    return true;
  }
}

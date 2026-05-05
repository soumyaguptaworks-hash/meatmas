import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  appContext: string;
}

export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    return field ? user?.[field] : user;
  },
);

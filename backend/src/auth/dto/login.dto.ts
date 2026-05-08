import { IsEmail, IsOptional, IsEnum, IsString, MinLength } from 'class-validator';

export type AppContext = 'ADMIN' | 'FACTORY' | 'POS';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'FACTORY', 'POS'])
  appContext?: AppContext;
}

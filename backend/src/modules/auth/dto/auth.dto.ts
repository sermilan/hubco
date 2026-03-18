import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'My Organization', required: false })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ enum: ['individual', 'enterprise', 'education'], required: false })
  @IsOptional()
  @IsEnum(['individual', 'enterprise', 'education'])
  organizationType?: 'individual' | 'enterprise' | 'education';
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ILoginDto, LoginResponseDto } from '@eicrud/shared/interfaces';

//@eicrud:cli:export:skip-superclient
export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  twoFA_code?: string;

  @IsOptional()
  @IsInt()
  expiresInSec?: number;
}

export class LoginReturnDto {
  userId: string;
  accessToken?: string;
  refreshTokenSec?: number;
}

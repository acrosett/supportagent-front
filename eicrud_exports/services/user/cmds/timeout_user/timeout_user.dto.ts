import { ITimeoutUserDto } from '@eicrud/shared/interfaces';
import { IsString, IsInt } from 'class-validator';

export class TimeoutUserDto {
  @IsString()
  userId: string;

  @IsInt()
  timeoutDurationMinutes: number;

  @IsString({ each: true })
  allowedRoles: string[];
}

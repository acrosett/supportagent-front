import { IUserIdDto } from '@eicrud/shared/interfaces';
import { IsString } from 'class-validator';

export class LogoutEverywhereDto {
  @IsString()
  userId: string;
}

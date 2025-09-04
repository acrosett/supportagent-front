import { ISendPasswordResetEmailDto } from '@eicrud/shared/interfaces';
import { IsEmail } from 'class-validator';

export class SendPasswordResetEmailDto {
  @IsEmail()
  email: string;
}

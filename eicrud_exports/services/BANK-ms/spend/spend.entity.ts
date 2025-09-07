import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";
import { Message } from "../../SUPPORT-ms/message/message.entity";
import { WhatsappMessage } from "../../WHATSAPP-ms/whatsapp-message/whatsapp-message.entity";
import { Task } from "../../AI-ms/task/task.entity";

export enum SpendType {
  MESSAGE = 'message',
  WHATSAPP = 'whatsapp',
  TASK = 'task',
  SUBSCRIPTION = 'subscription'
}

export class Spend {

    @IsString()
    @IsOptional()
    id: string;

    @IsEnum(SpendType)
    type: SpendType;

    @IsNumber()
    amount: number;

    @IsOptional()
    message?: Message;

    @IsOptional()
    whatsappMessage?: WhatsappMessage;

    @IsOptional()
    task?: Task;

    createdAt: Date;

    updatedAt: Date;

}
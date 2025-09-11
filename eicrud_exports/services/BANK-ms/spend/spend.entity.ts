import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";
import { Message } from "../../SUPPORT-ms/message/message.entity";
import { WhatsappMessage } from "../../WHATSAPP-ms/whatsapp-message/whatsapp-message.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { Client, ClientPriority } from "../../SUPPORT-ms/client/client.entity";

export enum SpendType {
  AI_THINKING = 'ai_thinking',
  WHATSAPP = 'whatsapp',
  SUBSCRIPTION = 'subscription',
}

export enum AgentType {
  FAQ_EDITOR = 'faq_editor',
  FILE_PROCESSOR = 'file_processor',
  STAFF_FACING = 'staff_facing',
  CLIENT_FACING = 'client_facing',
}

export class Think {
  @IsOptional()
  @IsEnum(AgentType)
  agentType?: AgentType;

  @IsNumber()
  inputBaseTokenCount: number;

  @IsNumber()
  inputProductConfigTokenCount: number;

  @IsNumber()
  inputHistoryTokenCount: number;

  @IsNumber()
  outputTokenCount: number;

  @IsString()
  outputType: string;

  modelType: 'smart' | 'fast';
}

export class Spend {

  @IsString()
  @IsOptional()
  id: string;

  @IsEnum(SpendType)
  type: SpendType;

  @IsNumber()
  amount: number;

  product: Product | string;

  @IsOptional()
  client?: Client | string;

  @IsOptional()
  @IsEnum(ClientPriority)
  clientPriority?: ClientPriority;

  @IsOptional()
  message?: Message;

  @IsOptional()
  whatsappMessage?: WhatsappMessage;

  @IsOptional()
  think?: Think;

  createdAt: Date;

  updatedAt: Date;

}
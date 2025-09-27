import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";
import { Message } from "../../SUPPORT-ms/message/message.entity";
import { WhatsappMessage } from "../../WHATSAPP-ms/whatsapp-message/whatsapp-message.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { Client, ClientPriority } from "../../SUPPORT-ms/client/client.entity";
import { Digestor } from "../../AI-ms/digestor/digestor.entity";
import { EditorTask } from "../../SUPPORT-ms/editor-task/editor-task.entity";

export enum SpendType {
  AI_THINKING = 'ai_thinking',
  AI_SUMMARY = 'ai_summary',
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
  inputBaseTokenCount?: number;

  @IsNumber()
  inputProductConfigTokenCount?: number;

  @IsNumber()
  inputHistoryTokenCount?: number;

  @IsNumber()
  outputTokenCount?: number;

  @IsString()
  outputType?: 'use_tools' | 'send_result' | 'throw_error';

  modelType?: 'smart' | 'fast' ;
}

export class Spend {

  @IsString()
  @IsOptional()
  id: string;

  @IsEnum(SpendType)
  type: SpendType;

  @IsNumber()
  amount: number;

  @IsString()
  product: Product | string;

  @IsOptional()
  client?: Client | string;

  @IsOptional()
  digestor?: Digestor | string;

  @IsOptional()
  @IsString()
  editorTask?: EditorTask | string;

  @IsOptional()
  @IsEnum(ClientPriority)
  clientPriority?: ClientPriority;

  @IsOptional()
  think?: Think;

  createdAt: Date;

  updatedAt: Date;

}
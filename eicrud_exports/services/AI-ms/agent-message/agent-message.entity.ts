import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";
import { Client } from "../../SUPPORT-ms/client/client.entity";
import { ContactConfig } from "../../WHATSAPP-ms/contact-config/contact-config.entity";


export enum AgentRole {
  CHAT_AGENT = 'chat_agent',
  STAFF_CONTACT_AGENT = 'staff_contact_agent'
}

export class AgentMessage {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    content: string;

    @IsEnum(AgentRole)
    fromAgent: AgentRole;

    @IsEnum(AgentRole)
    toAgent: AgentRole;

    product: Product | string;    
    
    client: Client | string;

    @IsString()
    @IsOptional()
    clientName?: string;

    @IsString()
    @IsOptional()
    clientEmail?: string;

    contactConfig: ContactConfig | string;

    createdAt: Date;

    updatedAt: Date;

}
import { IsString, IsOptional, IsEnum } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../../SUPPORT-ms/product/product.entity";


export enum AgentRole {
  CHAT_AGENT = 'chat_agent',
  EDITOR_AGENT = 'editor_agent',
  STAFF_CONTACT_AGENT = 'staff_contact_agent'
}

export class AgentMessage {

    @IsString()
    @IsOptional()
    id: string;

    owner: User | string;

    @IsString()
    content: string;

    @IsEnum(AgentRole)
    fromAgent: AgentRole;

    @IsEnum(AgentRole)
    toAgent: AgentRole;

    @IsString()
    @IsOptional()
    contextId?: string;

    product: Product;

    createdAt: Date;

    updatedAt: Date;

}
import { IsString, IsOptional, IsEnum } from "class-validator";
import { AgentType } from "../../BANK-ms/spend/spend.entity";
import { Client } from "../client/client.entity";
import { Product } from "../product/product.entity";
import { CustomTool } from "../custom-tool/custom-tool.entity";


export class ToolTrace {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsOptional()
    toolResult?: string;

    @IsString()
    @IsOptional()
    toolError?: string;

    @IsString()
    @IsOptional()
    toolInput?: string;

    @IsString()
    toolName: string;

    @IsEnum(AgentType)
    @IsOptional()
    agentType?: AgentType;

    @IsOptional()
    @IsString()
    client?: Client | string;

    @IsOptional()
    @IsString()
    product?: Product | string;

    @IsOptional()
    customTool?: CustomTool | string;

    createdAt: Date;

    updatedAt: Date;

}
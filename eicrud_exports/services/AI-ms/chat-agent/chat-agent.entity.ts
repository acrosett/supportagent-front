import { IsString, IsOptional, IsBoolean, IsDate } from "class-validator";
import { ContextPiece } from "../AiAgent";


export class ChatAgent {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    contextId: string;

    @IsString()
    content: string;

    @IsDate()
    date: Date;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsBoolean()
    isSummary?: boolean;

    @IsBoolean()
    isEphemeral?: boolean;

    @IsString()
    origin: string;

    metadata?: string;
}
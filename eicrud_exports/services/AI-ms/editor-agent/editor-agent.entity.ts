import { IsString, IsOptional, IsDate } from "class-validator";
import { ContextPiece } from "../shared";


export class EditorAgent {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    contextId: string;

    @IsString()
    content: string;

    @IsDate()
    date: Date;

    @IsString()
    origin: string;
    
    @IsDate()
    @IsOptional()
    expiryDate?: Date;

    createdAt: Date;

    updatedAt: Date;

}
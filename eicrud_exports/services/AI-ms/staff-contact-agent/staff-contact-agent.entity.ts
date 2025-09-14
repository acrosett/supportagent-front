import { IsString, IsOptional, IsDate } from "class-validator";
import { ContextPiece } from "../shared";


export class StaffContactAgent {

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
    @IsOptional()
    expiryDate?: Date;

    @IsString()
    origin: string;

    createdAt: Date;

    updatedAt: Date;

}
import { IsString, IsOptional, IsDate, IsBoolean } from "class-validator";
//


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
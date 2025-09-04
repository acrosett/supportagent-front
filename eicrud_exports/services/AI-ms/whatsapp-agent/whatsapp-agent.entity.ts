import { IsString, IsOptional } from "class-validator";


export class WhatsappAgent {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}
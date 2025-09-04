import { IsString, IsOptional } from "class-validator";


export class Email {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}
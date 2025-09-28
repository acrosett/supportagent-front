import { IsString, IsOptional } from "class-validator";


export class Captcha {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}
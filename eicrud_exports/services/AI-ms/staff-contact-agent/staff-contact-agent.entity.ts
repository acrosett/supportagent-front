import { IsString, IsOptional } from "class-validator";


export class StaffContactAgent {

    @IsString()
    @IsOptional()
    id: string;

    createdAt: Date;

    updatedAt: Date;

}
import { IsString, IsOptional, IsBoolean } from "class-validator";


export class ToggleAutoTopUpDto {

    @IsBoolean()
    enable: boolean;

    @IsString()
    product: string;

}

//used by super-client, update me here
export type ToggleAutoTopUpReturnDto = string;
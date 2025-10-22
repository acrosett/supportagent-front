import { IsString, IsOptional, IsAny } from "class-validator";


export class TestToolDto {

    @IsString()
    customToolId: string;

    @IsString()
    productId: string;

    @IsOptional()
    dto?: any;

}

//used by super-client, update me here
export type TestToolReturnDto = any;
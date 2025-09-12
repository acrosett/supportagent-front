import { IsString, IsOptional } from "class-validator";


export class VerifyDomainDto {

    @IsString()
    domainId: string;

    @IsString()
    productId: string;

}

//used by super-client, update me here
export type VerifyDomainReturnDto = string;
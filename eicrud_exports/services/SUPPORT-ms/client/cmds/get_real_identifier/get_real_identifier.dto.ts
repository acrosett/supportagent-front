import { IsString, IsOptional, MaxLength } from "class-validator";
import { Product } from "../../../product/product.entity";
import { Client } from "../../client.entity";
import { CheckMessageQuotaReturnDto } from "../check_message_quota/check_message_quota.dto";


export class GetRealIdentifierDto {

    @IsString()
    identifier: string;

    product: Product;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    recaptchaToken?: string;

}

//used by super-client, update me here
export type GetRealIdentifierReturnDto = Client;
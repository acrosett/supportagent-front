import { IsString, IsOptional } from "class-validator";
import { Product } from "../../../product/product.entity";
import { Client } from "../../client.entity";


export class GetRealIdentifierDto {

    @IsString()
    identifier: string;

    product: Product;

}

//used by super-client, update me here
export type GetRealIdentifierReturnDto = Client;
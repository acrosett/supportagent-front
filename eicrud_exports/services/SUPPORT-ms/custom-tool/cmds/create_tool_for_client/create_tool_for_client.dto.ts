import { IsString, IsOptional, ArrayMinSize, IsArray, IsBoolean, IsEnum, IsIn, IsUrl, Matches, MinLength, ValidateNested } from "class-validator";
import { ClientPriority } from "../../../client/client.entity";
import { Product } from "../../../product/product.entity";
import { HttpMethod, CustomToolArgument } from "../../custom-tool.entity";


export class CreateToolForClientDto {


    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl({require_tld: false})
    @Matches(/^https:\/\//, { message: 'URL must start with https://' })
    url: string;

    @IsEnum(HttpMethod)
    method: HttpMethod = HttpMethod.POST;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    arguments?: CustomToolArgument[] = [];

    @IsString()
    @IsIn(['application/json', 'application/x-www-form-urlencoded', 'text/plain', 'multipart/form-data'])
    @IsOptional()
    contentType?: string = 'application/json';

    @IsOptional()
    timeoutMs?: number = 30000; // Request timeout in milliseconds

    @IsArray()
    @IsEnum(ClientPriority, { each: true })
    @ArrayMinSize(1)
    clientPriorities?: ClientPriority[] = [ClientPriority.LOWEST, ClientPriority.REGULAR, ClientPriority.HIGH];

    @IsBoolean()
    @IsOptional()
    provideToolToGuests: boolean = true;

    @IsString()
    userId: string;

}

//used by super-client, update me here
export type CreateToolForClientReturnDto = string;
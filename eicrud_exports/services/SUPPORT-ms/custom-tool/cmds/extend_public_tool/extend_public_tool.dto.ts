import { IsString, IsOptional, ArrayMinSize, IsArray, IsBoolean, IsEnum, MinLength, ValidateNested } from "class-validator";
import { ClientPriority } from "../../../client/client.entity";
import { Product } from "../../../product/product.entity";
import { CustomTool, CustomToolArgument } from "../../custom-tool.entity";


export class ExtendPublicToolDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    arguments?: CustomToolArgument[] = [];

    @IsArray()
    @IsEnum(ClientPriority, { each: true })
    @ArrayMinSize(1)
    clientPriorities?: ClientPriority[] = [ClientPriority.LOWEST, ClientPriority.REGULAR, ClientPriority.HIGH];

    @IsBoolean()
    @IsOptional()
    provideToolToGuests: boolean = true;

    @IsOptional()
    version: number = 1;

    @IsString()
    product: Product | string;

    @IsString()
    publicToolId?: string;
    
    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

}

//used by super-client, update me here
export type ExtendPublicToolReturnDto = CustomTool;
import { IsString, IsOptional, ArrayMinSize, IsArray, IsBoolean, IsEnum, MinLength, ValidateNested } from "class-validator";
import { ClientPriority } from "../../../client/client.entity";
import { Product } from "../../../product/product.entity";
import { ArgumentValueType, CustomTool } from "../../custom-tool.entity";


export class PublicToolArgument {
    @IsString()
    @MinLength(3)
    name: string;


    @IsEnum(ArgumentValueType)
    valueType: ArgumentValueType;

    @IsString()
    @IsOptional()
    constantValue?: string; // Only used when valueType is CONSTANT

    @IsString()
    @IsOptional()
    defaultValue?: string;
    
    @IsString()
    @IsOptional()
    description?: string;

}

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
    arguments?: PublicToolArgument[] = [];

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
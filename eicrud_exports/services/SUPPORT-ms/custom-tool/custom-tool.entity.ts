import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsUrl, MinLength, IsBoolean, ArrayMinSize, Matches, IsIn } from "class-validator";
import { Product } from "../product/product.entity";
import { ClientPriority } from "../client/client.entity";

// Fields that trigger version increment when modified
export const VERSION_TRIGGERING_FIELDS: (keyof CustomTool)[] = [
    'name',
    'description', 
    'url',
    'method',
    'arguments',
    'contentType',
    'timeoutMs'
];

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
}

export enum ArgumentLocation {
    PAYLOAD = 'payload',       // In request body
    HEADER = 'header',         // In HTTP headers
    URL_PARAM = 'url_param',   // URL path parameters (/api/users/{id})
    QUERY_PARAM = 'query_param' // Query string parameters (?limit=10)
}

export enum ArgumentValueType {
    SHARED_SECRET = 'sharedSecret',  // Use product's shared secret
    USER_ID = 'userId',              // Use current user ID
    SET_BY_AI = 'setbyai',          // AI will provide the value
    CONSTANT = 'constant'            // Fixed constant value
}

export enum ArgumentDataType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    ARRAY = 'array'
}

export class CustomToolArgument {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEnum(ArgumentLocation)
    location: ArgumentLocation;
    
    @IsEnum(ArgumentDataType)
    dataType: ArgumentDataType;

    @IsEnum(ArgumentValueType)
    valueType: ArgumentValueType;

    @IsString()
    @IsOptional()
    constantValue?: string; // Only used when valueType is CONSTANT

    @IsString()
    @IsOptional()
    defaultValue?: string;

    @IsBoolean()
    @IsOptional()
    required?: boolean = true;
    
    @IsString()
    @IsOptional()
    description?: string;

}

export class CustomTool {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUrl({require_tld: false})
    @Matches(/^https/, { message: 'URL must start with https' })
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

    @IsBoolean()
    @IsOptional()
    enabled?: boolean;

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

    createdAt: Date;

    updatedAt: Date;

}
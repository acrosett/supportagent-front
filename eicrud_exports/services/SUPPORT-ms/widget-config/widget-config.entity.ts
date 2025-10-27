import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, Min, IsArray } from "class-validator";
import { User } from "../../user/user.entity";
import { Product } from "../product/product.entity";

export enum WidgetPosition {
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left',
}

export enum WidgetIcon {
  ROBOT = 'robot',
  MESSAGE = 'message',
  HEADSET = 'headset',
}

export class WidgetConfig {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    product: Product | string;

    @IsEnum(WidgetPosition)
    position: WidgetPosition;

    @IsString()
    width: string; // CSS size, e.g. '400px'

    @IsString()
    height: string; // CSS size, e.g. '600px'

    @IsString()
    primaryColor: string; // hex color

    @IsString()
    secondaryColor: string; // hex color

    @IsEnum(WidgetIcon)
    icon: WidgetIcon;

    @IsString()
    welcomeMessage: string;

    @IsArray()
    @IsString({ each: true })
    faqs: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    bounceAfterInit?: number; // seconds; >= 0

    @IsOptional()
    @IsNumber()
    @Min(0)
    periodicBounce?: number; // seconds; >= 0

    @IsBoolean()
    startOpen: boolean;

    @IsBoolean()
    darkMode: boolean;

    @IsBoolean()
    showAiDisclaimer: boolean = true;

    @IsBoolean()
    draggable: boolean;

    @IsBoolean()
    soundOn: boolean;

    createdAt: Date;

    updatedAt: Date;

}
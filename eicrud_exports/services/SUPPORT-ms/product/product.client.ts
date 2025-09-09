import { GetPublicInfoDto, GetPublicInfoReturnDto } from './cmds/get_public_info/get_public_info.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Product } from "./product.entity";


export class ProductClient extends CrudClient<Product> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'product'});
  }
  // GENERATED START
  async get_public_info(
      dto: GetPublicInfoDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetPublicInfoReturnDto> {
      return super.cmd('get_public_info', dto, options, copts);
  }

  async get_public_infoS(
      dto: GetPublicInfoDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetPublicInfoReturnDto> {
      return super.cmdS('get_public_info', dto, options, copts);
  }

  async get_public_infoL(
      dto: GetPublicInfoDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetPublicInfoReturnDto> {
      return super.cmdL('get_public_info', dto, options, copts) as any;
  }

  async get_public_infoSL(
      dto: GetPublicInfoDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetPublicInfoReturnDto> {
      return super.cmdSL('get_public_info', dto, options, copts) as any;
  }

}
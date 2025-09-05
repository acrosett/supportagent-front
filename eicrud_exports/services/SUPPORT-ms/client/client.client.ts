import { GetRealIdentifierDto, GetRealIdentifierReturnDto } from './cmds/get_real_identifier/get_real_identifier.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Client } from "./client.entity";


export class ClientClient extends CrudClient<Client> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'client'});
  }
  // GENERATED START
  async get_real_identifier(
      dto: GetRealIdentifierDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetRealIdentifierReturnDto> {
      return super.cmd('get_real_identifier', dto, options, copts);
  }

  async get_real_identifierS(
      dto: GetRealIdentifierDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetRealIdentifierReturnDto> {
      return super.cmdS('get_real_identifier', dto, options, copts);
  }

  async get_real_identifierL(
      dto: GetRealIdentifierDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetRealIdentifierReturnDto> {
      return super.cmdL('get_real_identifier', dto, options, copts) as any;
  }

  async get_real_identifierSL(
      dto: GetRealIdentifierDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetRealIdentifierReturnDto> {
      return super.cmdSL('get_real_identifier', dto, options, copts) as any;
  }

}
import { GetRealIdentifierDto, GetRealIdentifierReturnDto } from './cmds/get_real_identifier/get_real_identifier.dto';
import { CheckMessageQuotaDto, CheckMessageQuotaReturnDto } from './cmds/check_message_quota/check_message_quota.dto';
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

  async check_message_quota(
      dto: CheckMessageQuotaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckMessageQuotaReturnDto> {
      return super.cmd('check_message_quota', dto, options, copts);
  }

  async check_message_quotaS(
      dto: CheckMessageQuotaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckMessageQuotaReturnDto> {
      return super.cmdS('check_message_quota', dto, options, copts);
  }

  async check_message_quotaL(
      dto: CheckMessageQuotaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckMessageQuotaReturnDto> {
      return super.cmdL('check_message_quota', dto, options, copts) as any;
  }

  async check_message_quotaSL(
      dto: CheckMessageQuotaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CheckMessageQuotaReturnDto> {
      return super.cmdSL('check_message_quota', dto, options, copts) as any;
  }

}
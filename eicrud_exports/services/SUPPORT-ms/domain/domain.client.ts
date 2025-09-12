import { VerifyDomainDto, VerifyDomainReturnDto } from './cmds/verify_domain/verify_domain.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Domain } from "./domain.entity";


export class DomainClient extends CrudClient<Domain> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'domain'});
  }
  // GENERATED START
  async verify_domain(
      dto: VerifyDomainDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyDomainReturnDto> {
      return super.cmd('verify_domain', dto, options, copts);
  }

  async verify_domainS(
      dto: VerifyDomainDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyDomainReturnDto> {
      return super.cmdS('verify_domain', dto, options, copts);
  }

  async verify_domainL(
      dto: VerifyDomainDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyDomainReturnDto> {
      return super.cmdL('verify_domain', dto, options, copts) as any;
  }

  async verify_domainSL(
      dto: VerifyDomainDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyDomainReturnDto> {
      return super.cmdSL('verify_domain', dto, options, copts) as any;
  }

}
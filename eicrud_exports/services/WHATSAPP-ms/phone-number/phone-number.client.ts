import { VerifyCodeDto, VerifyCodeReturnDto } from './cmds/verify_code/verify_code.dto';
import { SendVerifyDto, SendVerifyReturnDto } from './cmds/send_verify/send_verify.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { PhoneNumber } from "./phone-number.entity";


export class PhoneNumberClient extends CrudClient<PhoneNumber> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'phone-number'});
  }
  // GENERATED START
  async verify_code(
      dto: VerifyCodeDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyCodeReturnDto> {
      return super.cmd('verify_code', dto, options, copts);
  }

  async verify_codeS(
      dto: VerifyCodeDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyCodeReturnDto> {
      return super.cmdS('verify_code', dto, options, copts);
  }

  async verify_codeL(
      dto: VerifyCodeDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyCodeReturnDto> {
      return super.cmdL('verify_code', dto, options, copts) as any;
  }

  async verify_codeSL(
      dto: VerifyCodeDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyCodeReturnDto> {
      return super.cmdSL('verify_code', dto, options, copts) as any;
  }

  async send_verify(
      dto: SendVerifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendVerifyReturnDto> {
      return super.cmd('send_verify', dto, options, copts);
  }

  async send_verifyS(
      dto: SendVerifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendVerifyReturnDto> {
      return super.cmdS('send_verify', dto, options, copts);
  }

  async send_verifyL(
      dto: SendVerifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendVerifyReturnDto> {
      return super.cmdL('send_verify', dto, options, copts) as any;
  }

  async send_verifySL(
      dto: SendVerifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendVerifyReturnDto> {
      return super.cmdSL('send_verify', dto, options, copts) as any;
  }

}
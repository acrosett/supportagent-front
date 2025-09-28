import { VerifyRecaptchaDto, VerifyRecaptchaReturnDto } from './cmds/verify_recaptcha/verify_recaptcha.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Captcha } from "./captcha.entity";


export class CaptchaClient extends CrudClient<Captcha> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'captcha'});
  }
  // GENERATED START
  async verify_recaptcha(
      dto: VerifyRecaptchaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyRecaptchaReturnDto> {
      return super.cmd('verify_recaptcha', dto, options, copts);
  }

  async verify_recaptchaS(
      dto: VerifyRecaptchaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyRecaptchaReturnDto> {
      return super.cmdS('verify_recaptcha', dto, options, copts);
  }

  async verify_recaptchaL(
      dto: VerifyRecaptchaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyRecaptchaReturnDto> {
      return super.cmdL('verify_recaptcha', dto, options, copts) as any;
  }

  async verify_recaptchaSL(
      dto: VerifyRecaptchaDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VerifyRecaptchaReturnDto> {
      return super.cmdSL('verify_recaptcha', dto, options, copts) as any;
  }

}
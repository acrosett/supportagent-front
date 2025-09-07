import { DigestFileDto, DigestFileReturnDto } from './cmds/digest_file/digest_file.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Digestor } from "./digestor.entity";


export class DigestorClient extends CrudClient<Digestor> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'digestor'});
  }
  // GENERATED START
  async digest_file(
      dto: DigestFileDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DigestFileReturnDto> {
      return super.cmd('digest_file', dto, options, copts);
  }

  async digest_fileS(
      dto: DigestFileDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DigestFileReturnDto> {
      return super.cmdS('digest_file', dto, options, copts);
  }

  async digest_fileL(
      dto: DigestFileDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DigestFileReturnDto> {
      return super.cmdL('digest_file', dto, options, copts) as any;
  }

  async digest_fileSL(
      dto: DigestFileDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DigestFileReturnDto> {
      return super.cmdSL('digest_file', dto, options, copts) as any;
  }

}
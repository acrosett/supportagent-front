import { SetDebugDto, SetDebugReturnDto } from './cmds/set_debug/set_debug.dto';
import { SearchDto, SearchReturnDto } from './cmds/search/search.dto';
import { GetDebugDto, GetDebugReturnDto } from './cmds/get_debug/get_debug.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Log } from "./log.entity";


export class LogClient extends CrudClient<Log> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'log'});
  }
  // GENERATED START
  async set_debug(
      dto: SetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SetDebugReturnDto> {
      return super.cmd('set_debug', dto, options, copts);
  }

  async set_debugS(
      dto: SetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SetDebugReturnDto> {
      return super.cmdS('set_debug', dto, options, copts);
  }

  async set_debugL(
      dto: SetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SetDebugReturnDto> {
      return super.cmdL('set_debug', dto, options, copts) as any;
  }

  async set_debugSL(
      dto: SetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SetDebugReturnDto> {
      return super.cmdSL('set_debug', dto, options, copts) as any;
  }

  async search(
      dto: SearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SearchReturnDto> {
      return super.cmd('search', dto, options, copts);
  }

  async searchS(
      dto: SearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SearchReturnDto> {
      return super.cmdS('search', dto, options, copts);
  }

  async searchL(
      dto: SearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SearchReturnDto> {
      return super.cmdL('search', dto, options, copts) as any;
  }

  async searchSL(
      dto: SearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SearchReturnDto> {
      return super.cmdSL('search', dto, options, copts) as any;
  }

  async get_debug(
      dto: GetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetDebugReturnDto> {
      return super.cmd('get_debug', dto, options, copts);
  }

  async get_debugS(
      dto: GetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetDebugReturnDto> {
      return super.cmdS('get_debug', dto, options, copts);
  }

  async get_debugL(
      dto: GetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetDebugReturnDto> {
      return super.cmdL('get_debug', dto, options, copts) as any;
  }

  async get_debugSL(
      dto: GetDebugDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetDebugReturnDto> {
      return super.cmdSL('get_debug', dto, options, copts) as any;
  }

}
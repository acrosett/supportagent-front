import { DebugLlmResultParsingDto, DebugLlmResultParsingReturnDto } from './cmds/debug_llm_result_parsing/debug_llm_result_parsing.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Debug } from "./debug.entity";


export class DebugClient extends CrudClient<Debug> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'debug'});
  }
  // GENERATED START
  async debug_llm_result_parsing(
      dto: DebugLlmResultParsingDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DebugLlmResultParsingReturnDto> {
      return super.cmd('debug_llm_result_parsing', dto, options, copts);
  }

  async debug_llm_result_parsingS(
      dto: DebugLlmResultParsingDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DebugLlmResultParsingReturnDto> {
      return super.cmdS('debug_llm_result_parsing', dto, options, copts);
  }

  async debug_llm_result_parsingL(
      dto: DebugLlmResultParsingDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DebugLlmResultParsingReturnDto> {
      return super.cmdL('debug_llm_result_parsing', dto, options, copts) as any;
  }

  async debug_llm_result_parsingSL(
      dto: DebugLlmResultParsingDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DebugLlmResultParsingReturnDto> {
      return super.cmdSL('debug_llm_result_parsing', dto, options, copts) as any;
  }

}
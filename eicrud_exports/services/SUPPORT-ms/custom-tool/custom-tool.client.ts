import { SearchDto, SearchReturnDto } from './cmds/search/search.dto';
import { CreateToolForClientDto, CreateToolForClientReturnDto } from './cmds/create_tool_for_client/create_tool_for_client.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { CustomTool } from "./custom-tool.entity";


export class CustomToolClient extends CrudClient<CustomTool> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'custom-tool'});
  }
  // GENERATED START
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

  async create_tool_for_client(
      dto: CreateToolForClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CreateToolForClientReturnDto> {
      return super.cmd('create_tool_for_client', dto, options, copts);
  }

  async create_tool_for_clientS(
      dto: CreateToolForClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CreateToolForClientReturnDto> {
      return super.cmdS('create_tool_for_client', dto, options, copts);
  }

  async create_tool_for_clientL(
      dto: CreateToolForClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CreateToolForClientReturnDto> {
      return super.cmdL('create_tool_for_client', dto, options, copts) as any;
  }

  async create_tool_for_clientSL(
      dto: CreateToolForClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<CreateToolForClientReturnDto> {
      return super.cmdSL('create_tool_for_client', dto, options, copts) as any;
  }

}
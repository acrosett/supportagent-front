import { SearchDto, SearchReturnDto } from './cmds/search/search.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Issue } from "./issue.entity";


export class IssueClient extends CrudClient<Issue> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'issue'});
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

}
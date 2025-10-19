import { VectorSearchDto, VectorSearchReturnDto } from './cmds/vector_search/vector_search.dto';
import { SearchDto, SearchReturnDto } from './cmds/search/search.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Faq } from "./faq.entity";


export class FaqClient extends CrudClient<Faq> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'faq'});
  }
  // GENERATED START
  async vector_search(
      dto: VectorSearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VectorSearchReturnDto> {
      return super.cmd('vector_search', dto, options, copts);
  }

  async vector_searchS(
      dto: VectorSearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VectorSearchReturnDto> {
      return super.cmdS('vector_search', dto, options, copts);
  }

  async vector_searchL(
      dto: VectorSearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VectorSearchReturnDto> {
      return super.cmdL('vector_search', dto, options, copts) as any;
  }

  async vector_searchSL(
      dto: VectorSearchDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<VectorSearchReturnDto> {
      return super.cmdSL('vector_search', dto, options, copts) as any;
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

}
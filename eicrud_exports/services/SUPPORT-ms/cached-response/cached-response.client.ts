import { DeleteCacheDto, DeleteCacheReturnDto } from './cmds/delete_cache/delete_cache.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { CachedResponse } from "./cached-response.entity";


export class CachedResponseClient extends CrudClient<CachedResponse> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'cached-response'});
  }
  // GENERATED START
  async delete_cache(
      dto: DeleteCacheDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteCacheReturnDto> {
      return super.cmd('delete_cache', dto, options, copts);
  }

  async delete_cacheS(
      dto: DeleteCacheDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteCacheReturnDto> {
      return super.cmdS('delete_cache', dto, options, copts);
  }

  async delete_cacheL(
      dto: DeleteCacheDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteCacheReturnDto> {
      return super.cmdL('delete_cache', dto, options, copts) as any;
  }

  async delete_cacheSL(
      dto: DeleteCacheDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteCacheReturnDto> {
      return super.cmdSL('delete_cache', dto, options, copts) as any;
  }

}
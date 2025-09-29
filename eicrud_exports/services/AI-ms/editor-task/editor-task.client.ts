import { RetryTaskDto, RetryTaskReturnDto } from './cmds/retry_task/retry_task.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { EditorTask } from "./editor-task.entity";


export class EditorTaskClient extends CrudClient<EditorTask> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'editor-task'});
  }
  // GENERATED START
  async retry_task(
      dto: RetryTaskDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<RetryTaskReturnDto> {
      return super.cmd('retry_task', dto, options, copts);
  }

  async retry_taskS(
      dto: RetryTaskDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<RetryTaskReturnDto> {
      return super.cmdS('retry_task', dto, options, copts);
  }

  async retry_taskL(
      dto: RetryTaskDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<RetryTaskReturnDto> {
      return super.cmdL('retry_task', dto, options, copts) as any;
  }

  async retry_taskSL(
      dto: RetryTaskDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<RetryTaskReturnDto> {
      return super.cmdSL('retry_task', dto, options, copts) as any;
  }

}
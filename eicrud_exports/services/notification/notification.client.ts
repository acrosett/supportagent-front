import { NotifyDto, NotifyReturnDto } from './cmds/notify/notify.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Notification } from "./notification.entity";


export class NotificationClient extends CrudClient<Notification> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'notification'});
  }
  // GENERATED START
  async notify(
      dto: NotifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<NotifyReturnDto> {
      return super.cmd('notify', dto, options, copts);
  }

  async notifyS(
      dto: NotifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<NotifyReturnDto> {
      return super.cmdS('notify', dto, options, copts);
  }

  async notifyL(
      dto: NotifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<NotifyReturnDto> {
      return super.cmdL('notify', dto, options, copts) as any;
  }

  async notifySL(
      dto: NotifyDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<NotifyReturnDto> {
      return super.cmdSL('notify', dto, options, copts) as any;
  }

}
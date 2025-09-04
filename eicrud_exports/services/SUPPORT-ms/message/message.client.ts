import { SendClientMessageDto, SendClientMessageReturnDto } from './cmds/send_client_message/send_client_message.dto';
import { SuperClientConfig, ClientOptions, CrudClient } from "@eicrud/client";
import { ICrudOptions } from "@eicrud/shared/interfaces";
import { Message } from "./message.entity";


export class MessageClient extends CrudClient<Message> {
  constructor(config: SuperClientConfig) {
    super({...config, serviceName: 'message'});
  }
  // GENERATED START
  async send_client_message(
      dto: SendClientMessageDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendClientMessageReturnDto> {
      return super.cmd('send_client_message', dto, options, copts);
  }

  async send_client_messageS(
      dto: SendClientMessageDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendClientMessageReturnDto> {
      return super.cmdS('send_client_message', dto, options, copts);
  }

  async send_client_messageL(
      dto: SendClientMessageDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendClientMessageReturnDto> {
      return super.cmdL('send_client_message', dto, options, copts) as any;
  }

  async send_client_messageSL(
      dto: SendClientMessageDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<SendClientMessageReturnDto> {
      return super.cmdSL('send_client_message', dto, options, copts) as any;
  }

}
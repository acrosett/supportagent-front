import { SendClientMessageDto, SendClientMessageReturnDto } from './cmds/send_client_message/send_client_message.dto';
import { GetClientMessagesDto, GetClientMessagesReturnDto } from './cmds/get_client_messages/get_client_messages.dto';
import { DeleteClientDto, DeleteClientReturnDto } from './cmds/delete_client/delete_client.dto';
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

  async get_client_messages(
      dto: GetClientMessagesDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetClientMessagesReturnDto> {
      return super.cmd('get_client_messages', dto, options, copts);
  }

  async get_client_messagesS(
      dto: GetClientMessagesDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetClientMessagesReturnDto> {
      return super.cmdS('get_client_messages', dto, options, copts);
  }

  async get_client_messagesL(
      dto: GetClientMessagesDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetClientMessagesReturnDto> {
      return super.cmdL('get_client_messages', dto, options, copts) as any;
  }

  async get_client_messagesSL(
      dto: GetClientMessagesDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<GetClientMessagesReturnDto> {
      return super.cmdSL('get_client_messages', dto, options, copts) as any;
  }

  async delete_client(
      dto: DeleteClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteClientReturnDto> {
      return super.cmd('delete_client', dto, options, copts);
  }

  async delete_clientS(
      dto: DeleteClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteClientReturnDto> {
      return super.cmdS('delete_client', dto, options, copts);
  }

  async delete_clientL(
      dto: DeleteClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteClientReturnDto> {
      return super.cmdL('delete_client', dto, options, copts) as any;
  }

  async delete_clientSL(
      dto: DeleteClientDto,
      options: ICrudOptions = undefined,
      copts?: ClientOptions,
    ): Promise<DeleteClientReturnDto> {
      return super.cmdSL('delete_client', dto, options, copts) as any;
  }

}
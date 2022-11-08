import type { Channel, Message } from "@prisma/client/connect";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { ChannelModel } from "../channels/channel.model";

@ObjectType( MessageModel.TYPENAME )
@Directive( `@key(fields: "id")` )
export class MessageModel implements Message {
	public static readonly TYPENAME = "Message";

	@Field( () => ID ) id: string;
	@Field() channelId: string;
	@Field() content: string;
	@Field() createdById: string;

	@Field( () => ChannelModel ) channel: Channel;
}
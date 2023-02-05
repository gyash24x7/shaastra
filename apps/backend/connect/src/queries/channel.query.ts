import type { IQuery, IQueryHandler } from "@nestjs/cqrs";
import { QueryHandler } from "@nestjs/cqrs";
import type { Channel, PrismaClient } from "@prisma/client/connect/index.js";
import { LoggerFactory, Prisma, PrismaService } from "@shaastra/framework";

export class ChannelQuery implements IQuery {
	constructor( public readonly channelId: string ) {}
}

@QueryHandler( ChannelQuery )
export class ChannelQueryHandler implements IQueryHandler<ChannelQuery, Channel> {
	private readonly logger = LoggerFactory.getLogger( ChannelQueryHandler );

	constructor( @Prisma() private readonly prismaService: PrismaService<PrismaClient> ) {}

	async execute( { channelId }: ChannelQuery ): Promise<Channel> {
		this.logger.debug( `>> execute()` );
		this.logger.debug( "Data: %o", { channelId } );
		const channel = await this.prismaService.client.channel.findUniqueOrThrow( { where: { id: channelId } } );
		this.logger.debug( "Channel found: %o", channel );
		return channel;
	};

}
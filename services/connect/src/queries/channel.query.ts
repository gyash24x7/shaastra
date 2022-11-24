import type { IQuery, IQueryHandler } from "@nestjs/cqrs";
import { QueryHandler } from "@nestjs/cqrs";
import type { Channel } from "../prisma";
import { PrismaService } from "../prisma";

export class ChannelQuery implements IQuery {
	constructor( public readonly id: string ) {}
}

@QueryHandler( ChannelQuery )
export class ChannelQueryHandler implements IQueryHandler<ChannelQuery, Channel> {
	constructor( private readonly prismaService: PrismaService ) {}

	execute( { id }: ChannelQuery ): Promise<Channel> {
		return this.prismaService.channel.findUniqueOrThrow( { where: { id } } );
	}
}
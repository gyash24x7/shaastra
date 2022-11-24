import type { IQuery, IQueryHandler } from "@nestjs/cqrs";
import { QueryHandler } from "@nestjs/cqrs";
import type { Message } from "../prisma";
import { PrismaService } from "../prisma";

export class MessagesQuery implements IQuery {
	constructor( public readonly userId: string ) {}
}

@QueryHandler( MessagesQuery )
export class MessagesQueryHandler implements IQueryHandler<MessagesQuery, Message[]> {
	constructor( private readonly prismaService: PrismaService ) {}

	execute( { userId }: MessagesQuery ): Promise<Message[]> {
		return this.prismaService.message.findMany( { where: { createdById: userId } } );
	}
}
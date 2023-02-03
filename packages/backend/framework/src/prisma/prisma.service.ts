import { INestApplicationContext, Injectable, Inject } from "@nestjs/common";
import { LoggerFactory } from "../logger/index.js";
import { PRISMA_CLIENT } from "./prisma.decorator.js";
import type { PrismaClientLike } from "./prisma.interfaces.js";
import { prismaLoggingMiddleware } from "./prisma.middleware.js";

@Injectable()
export class PrismaService<P extends PrismaClientLike> {
	private readonly logger = LoggerFactory.getLogger( PrismaService );

	constructor( @Inject( PRISMA_CLIENT ) public client: P ) {
		client.$use( prismaLoggingMiddleware( this.logger ) );
	}

	applyShutdownHooks( app: INestApplicationContext ) {
		this.client.$on( "beforeExit", async () => {
			await app.close();
		} );
	}
}
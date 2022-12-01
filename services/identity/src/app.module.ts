import { ConfigModule as NestConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule as NestJwtModule } from "@nestjs/jwt";
import { GraphQLModule as NestGraphQLModule } from "@nestjs/graphql";
import { apolloServerOptions } from "@shaastra/utils";
import { ConsulModule } from "@shaastra/consul";
import { HealthModule } from "@shaastra/health";
import { AuthModule } from "@shaastra/auth";
import { Module } from "@nestjs/common";
import appConfig from "./app.config.js";
import { PrismaService } from "./prisma/index.js";
import { CqrsModule } from "@nestjs/cqrs";
import { MailModule } from "@shaastra/mail";
import commandHandlers from "./commands/index.js";
import queryHandlers from "./queries/index.js";
import eventHandlers from "./events/index.js";
import resolvers from "./resolvers/index.js";
import type { Algorithm } from "jsonwebtoken";
import { readFileSync } from "fs";
import { join } from "path";

const ConfigModule = NestConfigModule.forRoot( { load: [ appConfig ], isGlobal: true } );

const GraphQLModule = NestGraphQLModule.forRoot( apolloServerOptions( "identity" ) );

const JwtModule = NestJwtModule.registerAsync( {
	imports: [ ConfigModule ],
	inject: [ ConfigService ],
	useFactory( configService: ConfigService ) {
		const audience = configService.getOrThrow<string>( "app.auth.audience" );
		const issuer = `http://${ configService.getOrThrow<string>( "app.auth.domain" ) }`;
		const passphrase = configService.getOrThrow<string>( "app.auth.key.passphrase" );
		const algorithm: Algorithm = "RS256";
		const keyid = configService.getOrThrow<string>( "app.auth.key.id" );

		const key = readFileSync( join( __dirname, "assets", ".private.key" ) ).toString();
		return {
			privateKey: { key, passphrase },
			signOptions: { audience, algorithm, issuer, keyid },
			verifyOptions: { audience, algorithms: [ algorithm ], issuer }
		};
	}
} );

const imports = [
	ConfigModule,
	ConsulModule,
	HealthModule,
	GraphQLModule,
	AuthModule,
	CqrsModule,
	JwtModule,
	MailModule
];

const providers = [ PrismaService, ...commandHandlers, ...queryHandlers, ...eventHandlers, ...resolvers ];

@Module( { imports, providers } )
export class AppModule {}
import { Args, Context, Mutation, Query, Resolver, ResolveReference } from "@nestjs/graphql";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { GqlContext, GqlResolveReferenceData } from "@shaastra/utils";
import { UserQuery } from "../queries/user.query.js";
import { LoginCommand, LoginInput } from "../commands/login.command.js";
import { AuthGuard, AuthInfo, UserAuthInfo } from "@shaastra/auth";
import { UseGuards } from "@nestjs/common";
import { VerifyUserCommand, VerifyUserInput } from "../commands/verify.user.command.js";
import type { User } from "../prisma/index.js";

@Resolver( "User" )
export class UserResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus
	) {}

	@UseGuards( AuthGuard )
	@Query()
	authInfo( @AuthInfo() authInfo: UserAuthInfo ): string {
		return JSON.stringify( authInfo );
	}

	@Mutation()
	async login( @Args( "data" ) data: LoginInput, @Context() ctx: GqlContext ): Promise<boolean> {
		const token: string = await this.commandBus.execute( new LoginCommand( data ) );
		ctx.res.setHeader( "x-access-token", token );
		return !!token;
	}

	@Mutation()
	async verifyUser( @Args( "data" ) data: VerifyUserInput ): Promise<string> {
		return this.commandBus.execute( new VerifyUserCommand( data ) );
	}

	@UseGuards( AuthGuard )
	@Mutation()
	logout( @Context() ctx: GqlContext, @AuthInfo() authInfo: UserAuthInfo ): boolean {
		ctx.res.setHeader( "x-logout", authInfo.id );
		return true;
	}

	@ResolveReference()
	resolveReference( reference: GqlResolveReferenceData ): Promise<User> {
		return this.queryBus.execute( new UserQuery( reference.id ) );
	}
}
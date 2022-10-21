import { Args, Context, Mutation, Query, Resolver, ResolveReference } from "@nestjs/graphql";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import type { GqlContext, GqlResolveReferenceData } from "@shaastra/utils/graphql";
import { UserQuery } from "./queries/user.query";
import { LoginCommand, LoginInput } from "./commands/login.command";
import { CreateUserCommand, CreateUserInput } from "./commands/create.user.command";
import { AuthGuard, AuthPayload, AuthUser } from "@shaastra/auth";
import { UseGuards } from "@nestjs/common";
import type { VerifyUserInput } from "./commands/verify.user.command";
import { VerifyUserCommand } from "./commands/verify.user.command";
import type { User } from "@prisma/client/identity";

@Resolver( "User" )
export class UserResolver {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly commandBus: CommandBus
	) {}

	@UseGuards( AuthGuard )
	@Query()
	me( @AuthUser() payload: AuthPayload ): Promise<User> {
		return this.queryBus.execute( new UserQuery( payload.sub! ) );
	}

	@Mutation()
	async login( @Args( "data" ) data: LoginInput, @Context() ctx: GqlContext ): Promise<boolean> {
		const token: string = await this.commandBus.execute( new LoginCommand( data ) )
		ctx.res.setHeader( "x-access-token", token );
		return !!token;
	}

	@Mutation()
	createUser( @Args( "data" ) data: CreateUserInput ): Promise<boolean> {
		return this.commandBus.execute( new CreateUserCommand( data ) );
	}

	@Mutation()
	verifyUser( @Args( "data" ) data: VerifyUserInput ): Promise<boolean> {
		return this.commandBus.execute( new VerifyUserCommand( data ) );
	}

	@ResolveReference()
	resolveReference( reference: GqlResolveReferenceData ): Promise<User> {
		return this.queryBus.execute( new UserQuery( reference.id ) );
	}
}
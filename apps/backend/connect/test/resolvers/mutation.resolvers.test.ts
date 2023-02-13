import type { CommandBus } from "@nestjs/cqrs";
import { Message, ChannelType, Channel } from "@prisma/client/connect/index.js";
import type { UserAuthInfo, GraphQLResolverParams } from "@shaastra/framework";
import { describe, it, expect, afterEach } from "vitest";
import { mockDeep, mockClear } from "vitest-mock-extended";
import {
	CreateChannelCommand,
	CreateMessageCommand,
	CreateMessageInput,
	CreateChannelInput
} from "../../src/commands/index.js";
import { MutationResolvers } from "../../src/resolvers/index.js";

describe( "Mutation Resolvers", () => {

	const mockCommandBus = mockDeep<CommandBus>();

	const mockAuthInfo: UserAuthInfo = {
		department: "WEBOPS",
		id: "mock-user-id",
		position: "COORD"
	};

	const mockCreateChannelInput: CreateChannelInput = {
		description: "Mock Channel Description",
		name: "Mock Channel",
		type: ChannelType.GROUP
	};

	const mockChannel: Channel = {
		archived: false,
		createdById: mockAuthInfo.id,
		createdOn: new Date(),
		id: "some-channel-id",
		...mockCreateChannelInput
	};

	const mockCreateMessageInput: CreateMessageInput = { channelId: mockChannel.id, content: "Message Content" };

	const mockMessage: Message = {
		createdById: "mock-user-id",
		id: "some-mock-id",
		createdOn: new Date(),
		...mockCreateMessageInput
	};

	it( "should publish create message command when createMessage is called", async () => {
		mockCommandBus.execute.calledWith( expect.any( CreateMessageCommand ) ).mockResolvedValue( mockMessage );
		const mockGqlParams = mockDeep<GraphQLResolverParams<CreateMessageInput>>();
		mockGqlParams.context.authInfo = mockAuthInfo;
		mockGqlParams.args.data = mockCreateMessageInput;

		const resolver = new MutationResolvers( mockCommandBus );
		const message = await resolver.createMessage( mockGqlParams );

		expect( message ).toEqual( mockMessage );
		expect( mockCommandBus.execute ).toHaveBeenCalledWith(
			new CreateMessageCommand( mockCreateMessageInput, mockAuthInfo )
		);
	} );

	it( "should publish create channel command when createChannel is called", async () => {
		mockCommandBus.execute.calledWith( expect.any( CreateChannelCommand ) ).mockResolvedValue( mockChannel );
		const mockGqlParams = mockDeep<GraphQLResolverParams<CreateChannelInput>>();
		mockGqlParams.context.authInfo = mockAuthInfo;
		mockGqlParams.args.data = mockCreateChannelInput;

		const resolver = new MutationResolvers( mockCommandBus );
		const channel = await resolver.createChannel( mockGqlParams );

		expect( channel ).toEqual( mockChannel );
		expect( mockCommandBus.execute ).toHaveBeenCalledWith(
			new CreateChannelCommand( mockCreateChannelInput, mockAuthInfo )
		);
	} );

	afterEach( () => {
		mockClear( mockCommandBus );
	} );
} );
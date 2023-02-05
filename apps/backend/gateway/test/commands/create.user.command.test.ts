import { HttpStatus, HttpException } from "@nestjs/common";
import type { EventBus } from "@nestjs/cqrs";
import type { User, PrismaClient } from "@prisma/client/identity/index.js";
import type { PrismaService } from "@shaastra/framework";
import { mockDeep, mockClear } from "vitest-mock-extended";
import type { CreateUserInput } from "../../src/commands/create.user.command.js";
import { CreateUserCommandHandler } from "../../src/commands/create.user.command.js";
import { UserMessages } from "../../src/constants/messages.js";
import { UserCreatedEvent } from "../../src/events/user.created.event.js";

describe( "Create User Command Handler", () => {

	const mockPrismaService = mockDeep<PrismaService<PrismaClient>>();
	const mockEventBus = mockDeep<EventBus>();
	const mockCreateUserInput: CreateUserInput = {
		id: "1244",
		email: "abcd@test.com",
		username: "user_name",
		password: "some_password",
		name: "abcd efgh",
		roles: []
	};

	const mockUser: User = { ...mockCreateUserInput, verified: false };
	mockPrismaService.client.user.create.mockResolvedValue( mockUser );

	it( "should throw exception if user with same email/username/id already exists", async () => {
		const { id, email, username } = mockCreateUserInput;
		mockPrismaService.client.user.findFirst.mockResolvedValue( mockUser );

		const createUserCommandHandler = new CreateUserCommandHandler( mockPrismaService, mockEventBus );

		expect.assertions( 5 );
		return createUserCommandHandler.execute( { data: mockCreateUserInput } )
			.catch( ( e: HttpException ) => {
				expect( e.message ).toBe( UserMessages.ALREADY_EXISTS );
				expect( e.getStatus() ).toBe( HttpStatus.CONFLICT );
				expect( mockPrismaService.client.user.create ).toHaveBeenCalledTimes( 0 );
				expect( mockEventBus.publish ).toHaveBeenCalledTimes( 0 );
				expect( mockPrismaService.client.user.findFirst ).toHaveBeenCalledWith(
					{ where: { OR: { id, email, username } } }
				);
			} );
	} );

	it( "should create new user if user doesn't exist", async () => {
		const { id, email, username } = mockCreateUserInput;
		mockPrismaService.client.user.findFirst.mockResolvedValue( null );

		const createUserCommandHandler = new CreateUserCommandHandler( mockPrismaService, mockEventBus );

		const createdUserId = await createUserCommandHandler.execute( { data: mockCreateUserInput } );

		expect( createdUserId ).toBe( mockUser.id );
		expect( mockPrismaService.client.user.findFirst ).toHaveBeenCalledWith( {
			where: { OR: { id, email, username } }
		} );

		expect( mockPrismaService.client.user.create ).toHaveBeenCalledWith( {
			data: { ...mockCreateUserInput, password: expect.any( String ) }
		} );

		expect( mockEventBus.publish ).toHaveBeenCalledWith(
			new UserCreatedEvent( expect.objectContaining( { id: createdUserId } ) )
		);
	} );

	afterEach( () => {
		mockClear( mockPrismaService );
	} );
} );
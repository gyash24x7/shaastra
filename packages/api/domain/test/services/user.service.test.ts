import type { JwtService, PrismaService } from "@api/common";
import { CreateUserInput, TokenMessages, UserEvents, UserMessages, UserService } from "@api/domain";
import type { HttpException } from "@nestjs/common";
import { ConflictException } from "@nestjs/common";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { Token, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { afterEach, describe, expect, it } from "vitest";
import { mockClear, mockDeep } from "vitest-mock-extended";

describe( "User Service", () => {

	const mockPrismaService = mockDeep<PrismaService>();
	const mockEventEmitter = mockDeep<EventEmitter2>();
	const mockJwtService = mockDeep<JwtService>();
	const mockUser = mockDeep<User>();
	const mockToken: Token = {
		id: "some_token_id",
		expiry: dayjs().add( 2, "d" ).toDate(),
		hash: "some_hash",
		userId: "some_user_id",
		createdAt: new Date()
	};

	it( "should create new user when createUser is called", async () => {
		const { password, ...data } = mockDeep<CreateUserInput>();
		mockPrismaService.user.findFirst.mockResolvedValue( null );
		mockPrismaService.user.create.mockResolvedValue( mockUser );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );
		const user = await userService.createUser( { password: "some_password", ...data } );

		expect( user ).toBe( mockUser );
		expect( mockPrismaService.user.findFirst ).toHaveBeenCalledWith( {
			where: {
				OR: {
					email: data.email,
					username: data.username
				}
			}
		} );
		expect( mockPrismaService.user.create ).toHaveBeenCalledWith( { data: expect.objectContaining( data ) } );
		expect( mockEventEmitter.emit ).toHaveBeenCalledWith( UserEvents.CREATED, mockUser );
	} );

	it( "should should throw error when createUser is called and user with same email already exists", async () => {
		const data = mockDeep<CreateUserInput>();
		mockPrismaService.user.findFirst.mockResolvedValue( mockUser );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.createUser( data )
			.catch( e => {
				expect( e ).toBeInstanceOf( ConflictException );
				expect( e.getStatus() ).toBe( 409 );
				expect( e.message ).toBe( UserMessages.ALREADY_EXISTS );
				expect( mockPrismaService.user.findFirst ).toHaveBeenCalledWith( {
					where: {
						OR: {
							email: data.email,
							username: data.username
						}
					}
				} );
			} )
	} );

	it( "should verify credentials and return access token when login is called", async () => {
		mockUser.password = bcrypt.hashSync( "some_password", 10 );
		mockUser.verified = true;
		mockUser.id = "some_id";
		mockUser.roles = [ "MEMBER_WEBOPS", "POSITION_CORE" ];
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		mockJwtService.sign.mockResolvedValue( "some_token" );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );
		const { user, token } = await userService.login( {
			username: "some_username",
			password: "some_password"
		} );

		expect( user ).toBe( mockUser );
		expect( token ).toBe( "some_token" );
		expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( { where: { username: "some_username" } } );
		expect( mockJwtService.sign ).toHaveBeenCalledWith( {
			id: "some_id",
			verified: true,
			roles: [ "MEMBER_WEBOPS", "POSITION_CORE" ]
		} );
	} );

	it( "should throw error when login is called and passwords do not match", async () => {
		mockUser.password = bcrypt.hashSync( "some_password", 10 );
		mockUser.verified = true;
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.login( { username: "some_username", password: "wrong_password" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 400 );
				expect( error.message ).toBe( UserMessages.INVALID_CREDENTIALS );
				expect( mockJwtService.sign ).toHaveBeenCalledTimes( 0 );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( {
					where: { username: "some_username" }
				} );
			} );
	} );

	it( "should throw error when login is called and user is not verified", async () => {
		mockUser.verified = false;
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.login( { username: "some_username", password: "wrong_password" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 400 );
				expect( error.message ).toBe( UserMessages.NOT_VERIFIED );
				expect( mockJwtService.sign ).toHaveBeenCalledTimes( 0 );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( {
					where: { username: "some_username" }
				} );
			} );
	} );

	it( "should throw error when login is called and user is not found", async () => {
		mockPrismaService.user.findUnique.mockResolvedValue( null );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.login( { username: "some_username", password: "wrong_password" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 404 );
				expect( error.message ).toBe( UserMessages.NOT_FOUND );
				expect( mockJwtService.sign ).toHaveBeenCalledTimes( 0 );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( {
					where: { username: "some_username" }
				} );
			} );
	} );

	it( "should verify user and delete the verification token when verifyUser is called", async () => {
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		mockPrismaService.token.findFirst.mockResolvedValue( mockToken );
		mockPrismaService.user.update.mockResolvedValue( mockUser );
		mockPrismaService.token.delete.mockResolvedValue( mockToken );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );
		const user = await userService.verifyUser( { userId: "some_user_id", hash: "some_hash" } );

		expect( user ).toBe( mockUser );
		expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( { where: { id: "some_user_id" } } );
		expect( mockPrismaService.token.findFirst ).toHaveBeenCalledWith( {
			where: {
				userId: "some_user_id",
				hash: "some_hash"
			}
		} );
		expect( mockPrismaService.user.update ).toHaveBeenCalledWith( {
			where: { id: "some_user_id" },
			data: { verified: true }
		} );
		expect( mockPrismaService.token.delete ).toHaveBeenCalledWith( { where: { id: "some_token_id" } } );
	} );

	it( "should throw error when verifyUser is called and verification token has expired", async () => {
		mockToken.expiry = dayjs().subtract( 2, "d" ).toDate();
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		mockPrismaService.token.findFirst.mockResolvedValue( mockToken );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.verifyUser( { userId: "some_user_id", hash: "some_hash" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 400 );
				expect( error.message ).toBe( TokenMessages.EXPIRED );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( { where: { id: "some_user_id" } } );
				expect( mockPrismaService.token.findFirst ).toHaveBeenCalledWith( {
					where: {
						userId: "some_user_id",
						hash: "some_hash"
					}
				} );
			} );
	} );

	it( "should throw error when verifyUser is called and verification token is not found", async () => {
		mockPrismaService.user.findUnique.mockResolvedValue( mockUser );
		mockPrismaService.token.findFirst.mockResolvedValue( null );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 4 );
		return userService.verifyUser( { userId: "some_user_id", hash: "some_hash" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 404 );
				expect( error.message ).toBe( TokenMessages.NOT_FOUND );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( { where: { id: "some_user_id" } } );
				expect( mockPrismaService.token.findFirst ).toHaveBeenCalledWith( {
					where: {
						userId: "some_user_id",
						hash: "some_hash"
					}
				} );
			} );
	} );

	it( "should throw error when verifyUser is called and user is not found", async () => {
		mockPrismaService.user.findUnique.mockResolvedValue( null );
		const userService = new UserService( mockPrismaService, mockJwtService, mockEventEmitter );

		expect.assertions( 3 );
		return userService.verifyUser( { userId: "some_user_id", hash: "some_hash" } )
			.catch( ( error: HttpException ) => {
				expect( error.getStatus() ).toBe( 404 );
				expect( error.message ).toBe( UserMessages.NOT_FOUND );
				expect( mockPrismaService.user.findUnique ).toHaveBeenCalledWith( { where: { id: "some_user_id" } } );
			} );
	} );

	afterEach( () => {
		mockClear( mockPrismaService );
		mockClear( mockEventEmitter );
		mockClear( mockJwtService );
		mockClear( mockUser );
	} );
} );
import { CommandHandler, EventBus, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, Logger } from "@nestjs/common";
import { MemberMessages } from "../member.messages";
import { MemberCreatedEvent } from "../events/member.created.event";
import type { Department, MemberPosition } from "@prisma/client/workforce";
import { PrismaService } from "../../prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { ConsulService } from "@shaastra/consul";
import { ConfigService } from "@nestjs/config";
import type { CreateUserInput } from "../../../../identity/src/users/commands/create.user.command";
import { catchError, firstValueFrom } from "rxjs";
import type { AxiosError } from "@nestjs/terminus/dist/errors/axios.error";

export type CreateMemberInput = {
	name: string;
	email: string;
	password: string;
	rollNumber: string;
	department: Department;
	position: MemberPosition;
	mobile: string;
}

export class CreateMemberCommand implements ICommand {
	constructor( public readonly data: CreateMemberInput ) {}
}

@CommandHandler( CreateMemberCommand )
export class CreateMemberCommandHandler implements ICommandHandler<CreateMemberCommand, string> {
	private readonly logger = new Logger();

	constructor(
		private readonly prismaService: PrismaService,
		private readonly eventBus: EventBus,
		private readonly httpService: HttpService,
		private readonly consulService: ConsulService,
		private readonly configService: ConfigService
	) {}

	async createUser( data: CreateUserInput ): Promise<string> {
		const appId: string = this.configService.getOrThrow( "app.id" );
		const services = await this.consulService.getRegisteredServices( appId );
		const { Address, Port } = services.find( service => service.ID === "identity" )!;
		const url = `http://${ Address }:${ Port }/api/users`;
		const response = await firstValueFrom(
			this.httpService.post<string>( url, data ).pipe(
				catchError( ( error: AxiosError ) => {
					this.logger.error( error.response.data );
					throw "An error happened!";
				} )
			)
		);
		this.logger.log( `Response: ${ response }` );
		return response.data;
	}

	async execute( { data: { password, ...data } }: CreateMemberCommand ): Promise<string> {
		// Create User By Calling the API and get the user id
		const userId = await this.createUser( {
			name: data.name,
			email: data.email,
			password,
			username: data.rollNumber,
			roles: [ `MEMBER_${ data.department }`, `POSITION_${ data.position }` ]
		} );

		const existingMember = await this.prismaService.member.findUnique( {
			where: { id: userId }
		} );

		if ( existingMember ) {
			throw new ConflictException( MemberMessages.ALREADY_EXISTS );
		}

		const member = await this.prismaService.member.create( { data: { ...data, id: userId } } );
		this.eventBus.publish( new MemberCreatedEvent( member ) );
		return member.id;
	}
}
import type { IEvent, IEventHandler } from "@nestjs/cqrs";
import { EventsHandler, QueryBus } from "@nestjs/cqrs";
import { MailService } from "@shaastra/mail";
import type { Member } from "../prisma/index.js";
import { DeptCoreQuery } from "../queries/dept-core.query.js";

export class MemberCreatedEvent implements IEvent {
	constructor( public readonly data: Member ) {}
}

@EventsHandler( MemberCreatedEvent )
export class MemberCreatedEventHandler implements IEventHandler<MemberCreatedEvent> {
	constructor(
		private readonly mailService: MailService,
		private readonly queryBus: QueryBus
	) {}

	async handle( { data }: MemberCreatedEvent ) {
		const member: Member = await this.queryBus.execute( new DeptCoreQuery( data.department ) );
		const subject = `New Member requested to join ${ data.department }`;
		const content = `Please log in to Shaastra Prime and approve this request.`;
		await this.mailService.sendMail( { subject, content, email: member.email, name: member.name } );
	}
}
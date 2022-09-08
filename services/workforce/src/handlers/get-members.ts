import type { IQueryHandler } from "@nestjs/cqrs";
import { QueryHandler } from "@nestjs/cqrs";
import { GetMembersQuery } from "../queries/get-members";
import { WorkforcePrismaService } from "@shaastra/prisma";
import type { MemberModel } from "../models/member.model";

@QueryHandler( GetMembersQuery )
export class GetMembersQueryHandler implements IQueryHandler<GetMembersQuery> {
	constructor( private readonly prismaService: WorkforcePrismaService ) {}

	execute( { data }: GetMembersQuery ): Promise<MemberModel[]> {
		return this.prismaService.member.findMany( {
			where: {
				teams: !!data.team ? { some: { name: data.team } } : undefined,
				departments: !!data.department ? { has: data.department } : undefined
			}
		} );
	}

}
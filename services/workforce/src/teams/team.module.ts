import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TeamQueryHandler } from "./queries/team.query";
import { TeamResolver } from "./team.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { CreateTeamCommandHandler } from "./commands/create.team.command";
import { TeamCreatedEventHandler } from "./events/team.created.event";
import { MailModule } from "@shaastra/mail";

@Module( {
	imports: [ CqrsModule, PrismaModule, MailModule ],
	providers: [ CreateTeamCommandHandler, TeamCreatedEventHandler, TeamQueryHandler, TeamResolver ]
} )
export class TeamModule {}
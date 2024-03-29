import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import type { Member, TaskActivity } from "@prisma/client";
import type { TaskService } from "../services";

@Resolver()
export class TaskResolver {

	constructor( private readonly taskService: TaskService ) { }

	@ResolveField()
	async createdBy( @Parent() { id }: { id: string; } ): Promise<Member> {
		return this.taskService.getTaskCreator( id );
	}

	@ResolveField()
	async assignee( @Parent() { id }: { id: string; } ): Promise<Member | null> {
		return this.taskService.getTaskAssignee( id );
	}

	@ResolveField()
	async taskActivity( @Parent() { id }: { id: string; } ): Promise<TaskActivity[]> {
		return this.taskService.getTaskActivity( id );
	}
}
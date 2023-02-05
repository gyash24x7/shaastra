import type { User } from "./entities.js";
import type { MemberPosition, Department } from "./enums.js";

export type CreateMemberMutationData = {
	createMember: {
		id: string
		name: string
		email: string
		rollNumber: string
		profilePic: string
		position: MemberPosition
		department: Department
		about: string
	}
};

export type LoginMutationData = {
	user: User;
}

export type MeQueryData = {
	me: {
		id: string
		name: string
		email: string
		rollNumber: string
		position: MemberPosition
		profilePic: string
		coverPic: string
		department: Department
		enabled: boolean
	}
};
import type { Meta, StoryObj } from "@storybook/react";
import ListSelect, { ListSelectProps } from "./list-select";

const meta: Meta<ListSelectProps<string>> = { component: ListSelect, title: "ListSelect" };

export default meta;

export const Playground: StoryObj<ListSelectProps<string>> = {
	render: ( props ) => <ListSelect { ...props } />,
	args: {
		options: [
			{ label: "Person 1", value: "AB" },
			{ label: "Person 2", value: "CD" },
			{ label: "Person 3", value: "EF" }
		],
		label: "Select User",
		message: "Helper Text",
		placeholder: "Select favourite user"
	}
};
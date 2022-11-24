import type { JSX } from "solid-js/jsx-runtime";
import Flex, { FlexProps } from "./flex";

export default {
	component: Flex,
	subcomponents: {},
	title: "Flex",
	argTypes: {
		direction: {
			description: "Sets the axis of flex",
			options: [ "row", "col", "col-reverse", "row-reverse" ],
			control: { type: "inline-radio" },
			defaultValue: "row"
		},
		justify: {
			description: "Sets the distribution of child elements on the flex axis",
			options: [ "start", "end", "center", "space-between", "space-around", "space-evenly" ],
			control: { type: "inline-radio" },
			defaultValue: "start"
		},
		align: {
			description: "Sets the distribution of child elements perpendicular to the flex axis",
			options: [ "start", "end", "center", "baseline", "stretch" ],
			control: { type: "inline-radio" },
			defaultValue: "start"
		}
	}
};


const Template: any = ( args: JSX.IntrinsicAttributes & FlexProps ) => (
	<Flex { ...args }>
		<div class = { "bg-blue-300 p-4" }>Flex Child 1</div>
		<div class = { "bg-blue-500 p-4" }>Flex Child 2</div>
		<div class = { "bg-blue-700 p-4" }>Flex Child 3</div>
	</Flex>
);

export const Playground = Template.bind( {} );
Playground.args = { direction: "row", align: "start", justify: "start" } as FlexProps;
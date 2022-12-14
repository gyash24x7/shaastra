import { UserIcon, LockClosedIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Banner, Button, Form, minLengthValidator, patternValidator, TextInput, VStack, Flex } from "@shaastra/ui";
import { When } from "react-if";
import { Link } from "react-router-dom";

export const rollNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z][0-9]{3}$/;

export default function LoginPage() {
	return (
		<VStack className={ "h-screen p-8" }>
			<img src={ "/images/DarkLogo.png" } alt={ "Shaastra Logo" } className={ "w-60 h-auto mx-auto my-4" }/>
			<h2 className={ "font-light text-3xl" }>LOGIN</h2>
			<Form
				initialValue={ { rollNumber: "", password: "" } }
				onSubmit={ ( { password, rollNumber }: any ) => console.log( { username: rollNumber, password } ) }
				submitBtn={ () => {
					return (
						<Button
							appearance={ "primary" }
							type={ "submit" }
							buttonText={ "Submit" }
							fullWidth
						/>
					);
				} }
				renderMap={ {
					rollNumber: ( { appearance, error, ...props } ) => (
						<TextInput
							{ ...props }
							label={ "Roll Number" }
							placeholder={ "Enter your Roll Number" }
							renderIconAfter={ ( props ) => <UserIcon { ...props }/> }
							appearance={ appearance }
							message={ error }
						/>
					),
					password: ( { appearance, error, ...props } ) => (
						<TextInput
							{ ...props }
							type={ "password" }
							label={ "Password" }
							placeholder={ "Enter you Password" }
							renderIconAfter={ ( props ) => <LockClosedIcon { ...props }/> }
							appearance={ appearance }
							message={ error }
						/>
					)
				} }
				validations={ {
					rollNumber: [ patternValidator( rollNumberRegex, "Invalid Roll Number!" ) ],
					password: [ minLengthValidator( 8, "Password too Short!" ) ]
				} }
			/>
			<Flex justify={ "space-between" }>
				<span>Don't have an account?</span>
				<span>
					<Link to={ "/auth/signup" }>Signup</Link>
				</span>
			</Flex>
			<When condition={ false }>
				<Banner
					message={ "Some Error!" }
					appearance={ "danger" }
					renderIcon={ ( props ) => <ExclamationCircleIcon { ...props }/> }
				/>
			</When>
		</VStack>
	);
}

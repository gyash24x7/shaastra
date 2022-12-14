import type { Member } from "@prisma/client/workforce/index.js";
import { logger } from "../index.js";

export default async function memberEnabledEventHandler( data: Member ) {
	const subject = `Your Shaastra Prime Account is Enabled`;
	const content = `Hi ${ data.name }, You can now use Shaastra Prime.`;
	logger.debug( `Need to send mail here!` );
	logger.debug( `Subject: ${ subject }` );
	logger.debug( `Content: ${ content }` );
};

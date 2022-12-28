import type { ServiceContext } from "@shaastra/framework";
import { logger } from "@shaastra/framework";
import { AppQueries } from "./index.js";
import { prisma } from "../index.js";

export default async function messageQueryHandler( _data: unknown, _context: ServiceContext ) {
	const data = _data as { id: string };

	logger.debug( `Handling ${ AppQueries.MESSAGE_QUERY }...` );
	logger.debug( "Data: ", data );

	return prisma.message.findUnique( { where: { id: data.id } } );
};

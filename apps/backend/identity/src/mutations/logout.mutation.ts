import { logger } from "../index.js";
import { builder } from "../schema/builder.js";

builder.mutationField( "logout", t => t.boolean( {
	resolve( _parent, _args, { authInfo, res }, _info ) {
		logger.trace( `>> Resolvers::Mutation::logout()` );
		logger.trace( `>> Resolvers::Mutation::logout()` );
		res.setHeader( "x-logout", authInfo!.id );
		return true;
	}
} ) );
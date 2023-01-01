import type { GraphQLRequestContextWillSendResponse } from "@apollo/server";
import type { CookieOptions } from "express";
import { logger } from "../logger/index.js";

const accessTokenCookieOptions: CookieOptions = {
	maxAge: 9000000,
	httpOnly: true,
	domain: "localhost",
	path: "/",
	sameSite: "lax",
	secure: false
};

export function CookiePlugin() {
	return {
		async requestDidStart() {
			return {
				async willSendResponse( { contextValue }: GraphQLRequestContextWillSendResponse<any> ) {
					if ( !!contextValue.token ) {
						contextValue.res.cookie( "identity", contextValue.token, accessTokenCookieOptions );
						logger.debug( `Cookie Val: ${ contextValue.res.hasHeader( "Set-Cookie" ) }` );
					}

					if ( contextValue.logout ) {
						logger.debug( `Received Logout! Logging out....` );
						contextValue.res.clearCookie( "identity" );
					}
					logger.debug( `Sending response back to client...` );
				}
			};
		}
	};
}
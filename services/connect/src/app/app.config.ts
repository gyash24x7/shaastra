import { registerAs } from "@nestjs/config";
import type { AppConfig } from "@shaastra/utils/config";

const appConfig: AppConfig = {
	id: "connect",
	name: "Shaastra connect",
	pkg: "@shaastra/connect",
	port: 8020,
	address: "localhost",
	url: "http://localhost:8000",
	consul: {
		host: process.env[ "CONSUL_URL" ] || "localhost",
		port: process.env[ "CONSUL_PORT" ] || "8500"
	},
	prisma: {
		dbUrl: process.env[ "connect_DB_URL" ]!
	},
	auth: {
		audience: process.env[ "AUTH_AUDIENCE" ]!,
		domain: process.env[ "AUTH_DOMAIN" ]!,
		key: {
			id: process.env[ "AUTH_KEY_ID" ],
			passphrase: process.env[ "AUTH_KEY_PASSPHRASE" ]
		}
	},
	mail: {
		sender: { name: "Shaastra Prime", email: "prime@shaastra.org" },
		apiKey: process.env[ "MAILJET_API_KEY" ]!,
		apiSecret: process.env[ "MAILJET_API_SECRET" ]!
	}
};

export default registerAs( "app", () => appConfig );

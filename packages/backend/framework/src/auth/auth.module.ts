import { Module } from "@nestjs/common";
import { JwtService } from "./jwt.service.js";

@Module( {
	providers: [ JwtService ],
	exports: [ JwtService ]
} )
export class AuthModule {}
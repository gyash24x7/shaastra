import { afterAll, describe, expect, it, jest } from "@jest/globals";
import { mock, mockReset } from "jest-mock-extended";
import type { Server } from "http";
import type { Consul } from "../consul/index";
import type { AppInfo } from "../application/index";
import { HealthChecker } from "./health.checker";

jest.mock( "@godaddy/terminus" );

describe( "HealthChecker", function () {

	const mockHttpServer = mock<Server>();
	const mockConsul = mock<Consul>();
	const mockAppInfo: AppInfo = { address: "", name: "", pkg: "", port: 0, url: "", id: "mockApp" };

	let healthChecker: HealthChecker;

	it( "should return successful response when health api handler is invoked", async () => {
		healthChecker = new HealthChecker( mockHttpServer, mockConsul, mockAppInfo );
		const response = await healthChecker.healthApiHandler();
		expect( response.message ).toBe( "OK" );
	} );

	it( "should deregister app from consul when shutdown is received", async () => {
		healthChecker = new HealthChecker( mockHttpServer, mockConsul, mockAppInfo );
		await healthChecker.onSignal();
		expect( mockConsul.deregisterService ).toHaveBeenCalledWith( mockAppInfo.id );
	} );

	afterAll( () => {
		mockReset( mockHttpServer );
		mockReset( mockConsul );
	} );
} );
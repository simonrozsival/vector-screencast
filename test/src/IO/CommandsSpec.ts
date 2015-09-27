/// <reference path="../../../typings/tsd.d.ts" />

import { expect } from 'chai';
import IO from '../../../src/lib/VideoFormat/SVGAnimation/IO';

describe("Test the behavior of the Vector Screencast SVG parser", () => {
	it("the default IO handles SVG", () => {
		//throw new Error("Not implemented yet");
		var io = new IO();
		expect(io.GetExtension()).to.equal("svg");	
	});
});
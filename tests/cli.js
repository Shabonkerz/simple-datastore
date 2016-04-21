import _ from 'lodash';
import Cli from '../src/Cli';
import { describe, it } from 'mocha';
import { assert } from 'chai';


describe('Cli', () => {
	let cli;

	beforeEach(() => {
		cli = new Cli();
	});

	describe('end', () => {
		it(`should send 'end' event`, () => {
			let called = false;

			cli.on('end', () => {
				called = true;
			});

			cli.end();

			assert.isTrue(called);
		});
	});
});

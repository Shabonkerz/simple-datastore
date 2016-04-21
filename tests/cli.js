import _ from 'lodash';
import Cli, { CliError } from '../src/Cli';
import { describe, it } from 'mocha';
import { assert, expect } from 'chai';


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

	describe('_dispatchCommand', () => {
		it('should execute a command that exists', () => {
			let called = false;
			const command = 'END';

			cli.on('end', () => {
				called = true;
			});

			cli._dispatchCommand(command);

			assert.isTrue(called);
		});
		it('should throw error when command does not exist', () => {
            expect(() => {
				const command = 'NOOP';
                cli._dispatchCommand(command);
            }).to.throw(CliError);
		});
	});

	describe('connect', () => {
		it('should throw error if src is not readable.', () => {
            expect(() => {
				cli.connect(null, process.stdout);
            }).to.throw(CliError);
		});
		it('should throw error if dest is not writable.', () => {
            expect(() => {
				cli.connect(process.stdin, null);
            }).to.throw(CliError);
		});
		it('should not throw error if src is readable.', () => {
            expect(() => {
				cli.connect(process.stdin, process.stdout);
            }).to.not.throw(CliError);
		});
		it('should not throw error if dest is writable.', () => {
            expect(() => {
				cli.connect(process.stdin, process.stdout);
            }).to.not.throw(CliError);
		});
		it('should set src, dest, and rl properties', () => {
			cli.connect(process.stdin, process.stdout);
			assert.isNotNull(cli.src);
			assert.isNotNull(cli.dest);
			assert.isNotNull(cli.rl);
		});
	});
});

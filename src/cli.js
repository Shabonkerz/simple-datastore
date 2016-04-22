import Datastore from './datastore';
import TransactionManager from './transactionManager';
import readline from 'readline';
import EventEmitter from 'events';
import { Readable, Writable, Duplex, Transform } from 'stream';


export class CliError {
    constructor (message) {
        this.name = 'CliError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
}

export default class Cli extends EventEmitter {
	constructor (datastore) {
		super();

		// By default uses a new data store, unless one is provided.
		this.datastore = datastore || new Datastore();
		this.transactionManager = new TransactionManager(this.datastore);

		// Streams.
		this.src = null;
		this.dest = null;

		// We *could* just reuse SimpleDatastore's object for O(1) command
		// lookup, however, we might expose current/future private methods
		// to the REPL. So, here's essentially what amounts to a whitelist.
		this.commands = {
			'SET': this.datastore.set.bind(this.datastore),
			'GET': this.datastore.get.bind(this.datastore),
			'UNSET': this.datastore.unset.bind(this.datastore),
			'NUMEQUALTO': this.datastore.numEqualTo.bind(this.datastore),
			'END': this.end.bind(this),
			'BEGIN': this.transactionManager.begin.bind(this.transactionManager),
			'ROLLBACK': this.transactionManager.rollback.bind(this.transactionManager),
			'COMMIT': this.transactionManager.commit.bind(this.transactionManager)
		};

		// To be our readline instance.
		this.rl = null;
	}

	/**
	 * Terminates the CLI.
	 */
	end () {
		this.emit('end');
	}

	/**
	 * Sets the src/dest streams to read and write from.
	 * @param  {Stream} src  The stream to read from. e.g. process.stdin
	 * @param  {Stream} dest The stream to write to. e.g. process.stdout
	 */
	connect (src, dest) {

		if (!(src instanceof Readable || src instanceof Duplex || src instanceof Transform)) {
			throw new CliError('Source stream is not a readable stream.');
		}

		if (!(dest instanceof Writable || dest instanceof Duplex || dest instanceof Transform)) {
			throw new CliError('Destination stream is not a writable stream.');
		}

		this.src = src;
		this.dest = dest;
		this.rl = readline.createInterface(src, dest);
	}

	/**
	 * Starts the CLI for the datastore.
	 */
	init () {
		this.rl.setPrompt('> ');
		this.rl.prompt();

		this.rl
			.on('line', (line) => {
				this._onLine(line);
			})
			.on('close', () => {
				this.emit('end');
			});
	}

	/**
	 * Handles one line of input.
	 * @param  {string} line The line to process.
	 */
	_onLine (line) {

			const args = line.split(' ');
			let result;

			try {
				result = this._dispatchCommand(...args);

				if (result) {
					this.dest.write(result);
				}
			}
			catch (e) {
				if (e.message === 'Command not found.') {
					this.dest.write(`Unable to find ${args[0]} command.`);
				}
			}

			this.rl.prompt();

	}

	/**
	 * Handles lookup and execution of commands.
	 * @param  {string} 		command The command to execute.
	 * @param  {Array[string]} 	...args Arguments to pass to command.
	 * @return {string}					The result from execution of provided command.
	 */
	_dispatchCommand (...args) {
		const command = this.commands[args[0]];

		if (!command) {
			throw new CliError('Command not found.');
		}

		const result = command(...args.slice(1));

		return result !== undefined && result !== null ? `${result}\n` : '';
	}
}

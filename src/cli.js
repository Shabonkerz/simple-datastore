import Datastore from './datastore';
import TransactionManager from './transactionManager';
import readline from 'readline';
import EventEmitter from 'events';

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

		this.rl.on('line', (line) => {
			if (line === '') {
				return;
			}
			const args = line.split(' ');

			this._dispatchCommand(...args);

			this.rl.prompt();
		}).on('close', () => {
			this.emit('end');
		});
	}

	/**
	 * Handles lookup and execution of commands.
	 * @param  {string} 		command The command to execute.
	 * @param  {Array[string]} 	...args Arguments to pass to command.
	 */
	_dispatchCommand (...args) {
		const command = this.commands[args[0]];

		if (!command) {
			this.dest.write(`Unable to find ${args[0]} command.\n`);
			return;
		}

		const result = command(...args);

		if (result === undefined || result === null) {
			return;
		}

		this.dest.write(`${result}\n`);
	}
}

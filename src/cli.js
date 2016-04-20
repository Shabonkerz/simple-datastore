import Datastore from './datastore';
import readline from 'readline';

export default class Cli {
	constructor (datastore) {
		this.datastore = datastore || new Datastore();

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
			'END': this.end,
			'BEGIN': this.datastore.begin.bind(this.datastore),
			'ROLLBACK': this.datastore.rollback.bind(this.datastore),
			'COMMIT': this.datastore.commit.bind(this.datastore)
		};

		this.rl = null;
	}

	/**
	 * Terminates the CLI's process.
	 */
	end () {
		process.exit(0);
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
			const command = this.commands[args[0]];

			if (command) {
				const result = command(...args.slice(1));

				if (result !== undefined && result !== null)
				{
					this.dest.write(`${result}\n`);
				}
			}
			else
			{
				this.dest.write(`Unable to find ${args[0]} command.\n`);
			}

			this.rl.prompt();
		}).on('close', () => {
			process.exit(0);
		});
	}
}
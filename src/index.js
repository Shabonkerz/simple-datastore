import _ from 'lodash';
import readline from 'readline';


class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

class SimpleDatastore {
	constructor () {
		this.store = {};
		this.count = {};
		this.transactions = [];
		this.instream = null;
		this.outstream = null;

		// We *could* just reuse SimpleDatastore's object for O(1) command
		// lookup, however, we might expose current/future private methods
		// to the REPL. So, here's essentially what amounts to a whitelist.
		this.commands = {
			'set': this.set.bind(this),
			'get': this.get.bind(this),
			'unset': this.unset.bind(this),
			'numequalto': this.numEqualTo.bind(this),
			'end': this.end.bind(this),
			'begin': this.begin.bind(this),
			'rollback': this.rollback.bind(this),
			'commit': this.commit.bind(this)
		};
		this.rl = null;
	}

	connect (instream, outstream) {
		this.instream = instream;
		this.outstream = outstream;
		this.rl = readline.createInterface(instream, outstream);
		this.init();
	}

	init () {
		this.rl.setPrompt('> ');
		this.rl.prompt();

		this.rl.on('line', (line) => {
			if (line === '') {
				return;
			}
			const args = line.split(' ').map((a) => a.toLowerCase());
			const command = this.commands[args[0]];

			if (command) {
				const result = command(...args.slice(1));

				if (result !== undefined && result !== null)
				{
					this.outstream.write(`${result}\n`);
				}
			}
			else
			{
				this.outstream.write(`Unable to find ${args[0]} command.\n`);
			}

			this.rl.prompt();
		}).on('close', () => {
			process.exit(0);
		});
	}

	get (key) {
		return this.store[key] || 'NULL';
	}

	set (key, value) {

		// Find current value in store.
		const current = this.store[key];

		// If we found an entry, decrement it in count hash, since we're
		// removing it.
		if (current) {
			this.count[current]--;
		}

		// Update store with new value.
		this.store[key] = value;

		// Initialize if not there, increment if there.
		if (!current) {
			this.count[value] = 1;
		}
		else {
			this.count[value]++;
		}

		const transaction = this.transactions[this.transactions.length - 1];

		if (!transaction) {
			return;
		}

		transaction.undoCommands.push( () => {
			if (current) {
				this.set(key, current);
			}
			else {
				this.unset(key);
			}
		});
	}

	unset (key) {

		// Find current value in store.
		const value = this.store[key];

		// If we found an entry, decrement it in count hash, since we're
		// removing it.
		if (value) {
			this.count[value]--;
		}

		// Update store with new value.
		delete this.store[key];

		if (value) {
			const transaction = this.transactions[this.transactions.length - 1];

			if (!transaction) {
				return;
			}

			transaction.undoCommands.push( () => {
				this.set(key, value);
			});
		}
	}

	numEqualTo (value) {
		return this.count[value] || 0;
	}

	end () {
		process.exit(0);
	}

	begin () {
		this.transactions.push(new Transaction());
	}

	rollback () {
		if (!this.transactions.length) {
			return;
		}

		const currentTransaction = this.transactions[this.transactions.length - 1];

		for (let i = 0, commands = currentTransaction.undoCommands, length = commands.length; i < length; i++) {
			commands[i]();
		}

		this.transactions.pop();
	}

	commit () {
		if (!this.transactions.length) {
			return;
		}
		this.transactions.pop();
	}


}

const sds = new SimpleDatastore();

sds.connect(process.stdin, process.stdout);

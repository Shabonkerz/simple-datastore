class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

export default class Datastore {
	constructor () {

		this.store = {};
		this.count = {};

		this.transactions = [];
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

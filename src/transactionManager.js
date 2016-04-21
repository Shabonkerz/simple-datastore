import _ from 'lodash';

class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

export default class TransactionManager {
	constructor (store) {

		this.store = store;
		this.transactions = [];

		// Used to prevent the rollback from adding more commands to undo while
		// undoing commands.
		this.ignoreEvents = false;

		this.store
			.on('set', (key, previous, current) => {

				const transaction = this.transactions[this.transactions.length - 1];

				// We don't need to do anything if there is no top-level
				// transaction.
				if (!transaction) {
					return;
				}


				transaction.undoCommands.push( () => {
					if (previous) {
						this.store.set(key, previous);
					}
					else {
						this.store.unset(key);
					}
				});
			})
			.on('unset', (key, value) => {

				const transaction = this.transactions[this.transactions.length - 1];

				if (!transaction) {
					return;
				}

				transaction.undoCommands.push( () => {
					this.store.set(key, value);
				});

			});
	}

	begin () {
		this.transactions.push(new Transaction());
	}

	rollback () {

		// Ignore if there are no transactions present.
		if (!this.transactions.length) {
			return;
		}

		// Only rollback the top-level transaction.
		const currentTransaction = this.transactions[this.transactions.length - 1];

		// We don't want more commands pushed onto the undoCommands stack while
		// we're executing them. _.each and _.eachRight already ignore
		// modifications to the array while iterating over it, but it doesn't
		// prevent items from being added.
		this.ignoreEvents = true;
		_.eachRight(currentTransaction.undoCommands, (command) => {
			command();
		});
		this.ignoreEvents = false;

		this.transactions.pop();
	}

	commit () {
		// Ignore if no transactions are present.
		if (!this.transactions.length) {
			return;
		}

		// Changes are already in the store, so essentially we just need to
		// discard the transaction and its undo commands.
		this.transactions.pop();
	}
}

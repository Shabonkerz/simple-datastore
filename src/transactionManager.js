import _ from 'lodash';

export class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

export class TransactionManagerError {
    constructor (message) {
        this.name = 'TransactionManagerError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
}

export default class TransactionManager {
	constructor (store) {

		this.store = store;
		this.transactions = [];

		// Used to prevent the rollback from adding more commands to undo while
		// undoing commands.
		this.ignoreEvents = false;

		// Hook into datastore events to know when to push the 'undo' version
		// of the invoked command to undoCommands.
		this.store
			.on('set', (key, previous, current) => {

				const transaction = this.transactions[this.transactions.length - 1];

				// We don't need to do anything if there is no top-level
				// transaction.
				if (!transaction) {
					return;
				}

				// Two scenarios: The key existed with a different value, or
				// the key did not exist.
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

	/**
	 * Begins a new transaction.
	 */
	begin () {
		this.transactions.push(new Transaction());
	}

	/**
	 * Undoes any changes made to the store during the current transaction.
	 */
	rollback () {
		// Ignore if there are no transactions present.
		if (!this.transactions.length) {
			throw new TransactionManagerError('NO TRANSACTION');
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

	/**
	 * Makes any changes made to the store during the current transaction permanent.
	 */
	commit () {
		// Ignore if no transactions are present.
		if (!this.transactions.length) {
			throw new TransactionManagerError('NO TRANSACTION');
		}

		// Changes are already in the store, so essentially we just need to
		// discard the transactions.
		this.transactions.length = 0;
	}
}

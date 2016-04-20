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

		this.store
			.on('set', (key, previous, current) => {
				const transaction = this.transactions[this.transactions.length - 1];

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
					this.set(key, value);
				});
			});
	}

	begin () {
		this.transactions.push(new Transaction());
	}

	rollback () {
		if (!this.transactions.length) {
			return;
		}

		const currentTransaction = this.transactions[this.transactions.length - 1];

		_.forEach(currentTransaction.undoCommands, (command) => {
			command();
		});

		this.transactions.pop();
	}

	commit () {
		if (!this.transactions.length) {
			return;
		}
		this.transactions.pop();
	}
}

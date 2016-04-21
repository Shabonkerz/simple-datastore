import EventEmitter from 'events';

class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

export default class Datastore extends EventEmitter {
	constructor () {
		super();
		this.store = {};
		this.count = {};
	}

	get (key) {
		return this.store[key] || 'NULL';
	}

	set (key, value) {

		if (!key || !value) {
			return;
		}

		// Find current value in store.
		const previousValue = this.store[key];

		// If we found an entry, decrement it in count hash, since we're
		// removing it.
		if (previousValue) {
			this.count[previousValue]--;
		}

		// Update store with new value.
		this.store[key] = value;

		// Initialize if not there, increment if there.
		if (!(value in this.count)) {
			this.count[value] = 1;
		}
		else {
			this.count[value]++;
		}

		this.emit('set', key, previousValue, value);
	}

	unset (key) {

		if (!key) {
			return;
		}

		// Find current value in store.
		const value = this.store[key];


		if (!value) {
			return;
		}

		this.count[value]--;

		// Update store with new value.
		delete this.store[key];

		this.emit('unset', key, value);
	}

	numEqualTo (value) {
		return this.count[value] || 0;
	}
}

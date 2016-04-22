import EventEmitter from 'events';

/**
 * 	Represents a single transaction.
 */
class Transaction {
	constructor () {
		this.undoCommands = [];
	}
}

/**
 * 	In-memory data store.
 */
export default class Datastore extends EventEmitter {

	constructor () {
		super();
		this.store = {};
		this.count = {};
	}

	/**
	 * Retrieves a single value using the provided key.
	 * @param  {string} key
	 * @return {string} The value associated with `key`.
	 */
	get (key) {
		return this.store[key] || 'NULL';
	}

	/**
	 * Associates `value` with the key given.
	 * @param  {string} key
	 * @param  {string} value The value to associate with `key`.
	 */
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

	/**
	 * Sets the value associated with key to NULL.
	 * @param {string} key The key in the store to unset.
	 */
	unset (key) {

		if (!key) {
			return;
		}

		// Find current value in store.
		const value = this.store[key];

		// Nothing to unset.
		if (!value) {
			return;
		}

		this.count[value]--;

		// Update store with new value.
		delete this.store[key];

		this.emit('unset', key, value);
	}

	/**
	 * Retrieves the number of keys that match the given value.
	 * @param  {string} value 	The value to test against.
	 * @return {int}       		The number of keys that match given value.
	 */
	numEqualTo (value) {
		return this.count[value] || 0;
	}
}

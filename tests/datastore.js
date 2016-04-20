import Datastore from '../src/Datastore';
import { describe, it } from 'mocha';
import { assert } from 'chai';

describe('Datastore', () => {
	let datastore;

	beforeEach(() => {
		datastore = new Datastore();
	});

	describe('set', () => {
		it('should set a key in the store', () => {
			datastore.set('x', '1');
			assert.equal(datastore.store['x'], '1');
		});
		it('should update a key in the store', () => {
			datastore.set('x', '1');
			assert.equal(datastore.store['x'], '1');
			datastore.set('x', '2');
			assert.equal(datastore.store['x'], '2');
		});
		it('should not set null key to a value in the store', () => {
			datastore.set(null, '1');
			assert.notEqual(datastore.store[null], '1');
		});
		it('should increment count as keys with same value are added', () => {
			assert.equal(datastore.numEqualTo('1'), 0);
			datastore.set('x', '1');
			assert.equal(datastore.numEqualTo('1'), 1);
			datastore.set('y', '1');
			assert.equal(datastore.numEqualTo('1'), 2);
			datastore.set('z', '1');
			assert.equal(datastore.numEqualTo('1'), 3);
		});
	});

	describe('get', () => {
		it('should get a value in the store', () => {
			datastore.set('x', '1');
			assert.equal(datastore.store['x'], '1');
			assert.equal(datastore.store['x'], datastore.get('x'));
		});
		it('should return NULL for null key in the store', () => {
			datastore[null] = '1';
			assert.equal(datastore.get(null), 'NULL');
		});
		it('should return NULL for keys not in the store', () => {
			assert.equal(datastore.get('x'), 'NULL');
		});
	});

	describe('unset', () => {
		it('should unset a key in the store', () => {
			datastore.set('x', '1');
			assert.equal(datastore.store['x'], '1');
			datastore.unset('x');
			assert.equal(datastore.store['x'], undefined);
		});
		it('should decrement the count as keys of same value are unset', () => {
			assert.equal(datastore.numEqualTo('1'), 0);
			datastore.set('x', '1');
			assert.equal(datastore.numEqualTo('1'), 1);
			datastore.set('y', '1');
			assert.equal(datastore.numEqualTo('1'), 2);
			datastore.set('z', '1');
			assert.equal(datastore.numEqualTo('1'), 3);
			datastore.unset('z');
			assert.equal(datastore.numEqualTo('1'), 2);
			datastore.unset('y');
			assert.equal(datastore.numEqualTo('1'), 1);
			datastore.unset('x');
			assert.equal(datastore.numEqualTo('1'), 0);
		});
	});
});

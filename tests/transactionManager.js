import _ from 'lodash';
import Datastore from '../src/Datastore';
import TransactionManager, { Transaction } from '../src/transactionManager';
import { describe, it } from 'mocha';
import { assert } from 'chai';


describe('TransactionManager', () => {
	let manager, datastore;

	beforeEach(() => {
		datastore = new Datastore();
		manager = new TransactionManager(datastore);
	});

	describe('begin', () => {
		it('should create a new transaction and place it at top of transactions stack', () => {
			assert.equal(manager.transactions.length, 0);
			manager.begin();
			assert.equal(manager.transactions.length, 1);
			manager.transactions.push('identifier');
			manager.begin();
			assert.equal(manager.transactions.length, 3);
			assert.isTrue(manager.transactions.pop() instanceof Transaction);
			assert.isTrue(manager.transactions.pop() === 'identifier');
		});
	});

	describe('commit', () => {
		it('should remove the top transaction', () => {
			assert.equal(manager.transactions.length, 0);
			manager.begin();
			assert.equal(manager.transactions.length, 1);
			manager.commit();
			assert.equal(manager.transactions.length, 0);
		});
		it('should remove only the top transaction', () => {
			assert.equal(manager.transactions.length, 0);
			manager.begin();
			datastore.set('x', '10');
			manager.begin();
			assert.equal(manager.transactions.length, 2);
			manager.commit();
			assert.equal(manager.transactions.length, 1);
			assert.equal(manager.transactions[0].undoCommands.length, 1);
		});
	});

	describe('rollback', () => {
		it('should undo one performed set command', () => {
			datastore.set('x', '10');
			manager.begin();
			datastore.set('x', '20');
			assert.equal(datastore.get('x'), '20');
			manager.rollback();
			assert.equal(datastore.get('x'), '10');
		});
		it('should undo multiple performed set commands', () => {
			datastore.set('x', '10');
			datastore.set('y', '30');

			manager.begin();

			datastore.set('x', '20');
			datastore.set('y', '40');

			assert.equal(datastore.get('x'), '20');
			assert.equal(datastore.get('y'), '40');

			manager.rollback();

			assert.equal(datastore.get('x'), '10');
			assert.equal(datastore.get('y'), '30');
		});
		it('should undo one performed unset command', () => {
			datastore.set('x', '10');
			manager.begin();
			datastore.unset('x');
			assert.equal(datastore.get('x'), 'NULL');
			manager.rollback();
			assert.equal(datastore.get('x'), '10');
		});
		it('should undo multiple performed unset commands', () => {
			datastore.set('x', '10');
			datastore.set('y', '30');

			manager.begin();

			datastore.unset('x');
			datastore.unset('y');

			assert.equal(datastore.get('x'), 'NULL');
			assert.equal(datastore.get('y'), 'NULL');

			manager.rollback();

			assert.equal(datastore.get('x'), '10');
			assert.equal(datastore.get('y'), '30');
		});
		it('should undo a mix of set/unset commands', () => {
			datastore.set('x', '10');
			datastore.set('y', '30');

			manager.begin();

			datastore.unset('x');
			datastore.set('y', '40');

			assert.equal(datastore.get('x'), 'NULL');
			assert.equal(datastore.get('y'), '40');

			manager.rollback();

			assert.equal(datastore.get('x'), '10');
			assert.equal(datastore.get('y'), '30');
		});
		it('should undo a mix of set/unset commands(reverse order of above test)', () => {
			datastore.set('x', '10');
			datastore.set('y', '30');

			manager.begin();

			datastore.set('x', '20');
			datastore.unset('y');

			assert.equal(datastore.get('x'), '20');
			assert.equal(datastore.get('y'), 'NULL');

			manager.rollback();

			assert.equal(datastore.get('x'), '10');
			assert.equal(datastore.get('y'), '30');
		});
	});
});

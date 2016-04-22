# Simple datastore

A simplistic redis clone, whereby it stores key-value pairs and is accessible
programmatically, or via the provided CLI.

## CLI Commands

### `SET <key> <value>`

Sets a particular key to the specified value in the datastore.

```
> SET x 10
> GET x
10
```

### `GET <key>`

Retrieves the specified key's value.

```
> SET x 10
> GET x
10
```

### `UNSET <key>`

Deletes the specified key.

```
> SET x 10
> GET x
10
> UNSET x
> GET x
NULL
```

### `NUMEQUALTO <value>`

Retrieves the number of keys with the specified value.

```
> SET x 10
> GET x
10
> SET y 10
> NUMEQUALTO 10
2
```

### `BEGIN`

Starts a new transaction. Transactions can be nested.

```
> SET x 10
> GET x
10
> BEGIN
> SET x 20
> GET x
20
> ROLLBACK
> GET x
10
```

### `COMMIT`

Commits the changes made to the datastore.

```
> SET x 10
> GET x
10
> BEGIN
> SET x 20
> GET x
20
> COMMIT
> GET x
20
```

### `ROLLBACK`

Undoes any changes made to the datastore during the current transaction.

```
> SET x 10
> GET x
10
> BEGIN
> SET x 20
> GET x
20
> ROLLBACK
> GET x
10
```

### `END`

Terminates the CLI and triggers it's `end` event.

```
> SET 10
> END
(program terminates)
```

## Datastore Usage

In addition to using the CLI, you can also access the datastore programmatically.

#### Constructor

##### Arguments:

None.

##### Example:

```javascript
const store = new Datastore();
```

### Methods
#### `set(key, value)`

Sets the key to specified value. Will trigger the `set` event with key, old value, and new value.

##### Arguments:

1. `key` *(string)*: The key to set.
2. `value` *(value)*: The value to associate with the key.

##### Returns:

Nothing.

##### Example:

```javascript
store.set('x', '10');
```

#### `get(key)`

Retrieves the key's associated value.

##### Arguments:

1. `key` *(string)*: The key to lookup.

##### Returns:

(string): The value associated with the key in the store.

##### Example:

```javascript
store.set('x', '10');
const result = store.get('x');
console.log(result);
// 10
```

#### `unset(key)`

Deletes the key in the store. Will emit the `unset` event with key, and key's old value.

##### Arguments:

1. `key` *(string)*: The key to delete.

##### Returns:

Nothing.

##### Example:
```javascript
store.set('x', '10');
let result = store.get('x');
console.log(result);
// 10
store.unset('x');
let result = store.get('x');
console.log(result);
// NULL
```

#### `numEqualTo(value)`

Returns a count of the number of keys matching the value specified.

##### Arguments:

1. `value` *(string)*: The value to test against.

##### Returns:

(int): The number of keys that match `value`;

##### Example:

```javascript
store.set('x', '10');
store.set('y', '10');
let result = store.numEqualTo('10');
console.log(result);
// 2
```

### Events

#### `set`

#### Arguments
1. key *(string)*: The key that was set.
2. oldValue *(string)*: The value of key prior to being set.
3. newValue *(string)*: The new value of key.

#### `unset`

#### Arguments
1. key *(string)*: The key that was unset.
2. oldValue *(string)*: The value of key prior to being unset.

## Transaction Manager Usage

#### Constructor

##### Arguments:

1. `datastore` *(Datastore)*: The datastore to apply transactions to.

##### Example:

```javascript
const store = new Datastore();
const manager = new TransactionManager(store);
```

### Methods

#### `begin()`

Starts a new transaction.

##### Arguments:

None.

##### Returns:

Nothing.

##### Example:

```javascript
manager.begin();
```
#### `commit()`

Starts a new transaction.

##### Arguments:

None.

##### Returns:

Nothing.

##### Example:

```javascript
store.set('x', '10');
manager.begin();
store.set('x', '20');
manager.commit();
const result = store.get('x');
console.log(result);
// 20
```

#### `rollback()`

Starts a new transaction.

##### Arguments:

None.

##### Returns:

Nothing.

##### Example:

```javascript
store.set('x', '10');
manager.begin();
store.set('x', '20');
manager.rollback();
const result = store.get('x');
console.log(result);
// 10
```

## CLI Usage

#### Constructor

The Cli constructor will either use the datastore provided, or create its own. It will create its own TransactionManager instance.

##### Arguments:

1. `datastore` *(Datastore)*: The datastore to attach the CLI to.

##### Example:

```javascript
const store = new Datastore();
const cli = new Cli(store);
```

### Methods

#### `end()`

Emits the `end` event.

##### Arguments:

None.

##### Returns:

Nothing.

##### Example:

```javascript
cli.end();
```

### Events

#### `end`

Emitted when a call to the `end()` method is made.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `npm run-script build`
* `npm start`

## Contributing

* Fork it!
* Create your feature branch: `git checkout -b my-new-feature`
* Commit your changes: `git commit -am 'Add some feature'`
* Push to the branch: `git push origin my-new-feature`
* Submit a pull request :D

## License

MIT © Asa Rudick

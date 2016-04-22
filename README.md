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

### Constructor

```javascript
const store = new Datastore();
```

### set(key, value)

Sets the key to specified value. Will trigger the `set` event with key, old value, and new value.

```javascript
store.set('x', '10');
```

### get(key)

Retrieves the key's associated value.

NOTE: Returns a string.

```javascript
store.set('x', '10');
const result = store.get('x');
console.log(result);
// 10
```

### unset(key)

Deletes the key in the store. Will emit the `unset` event with key, and key's old value.

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

### numEqualTo(value)

Returns a count of the number of keys matching the value specified.

```javascript
store.set('x', '10');
store.set('y', '10');
let result = store.numEqualTo('10');
console.log(result);
// 2
```

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

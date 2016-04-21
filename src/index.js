import _ from 'lodash';
import Cli from './cli';

const cli = new Cli();

cli.connect(process.stdin, process.stdout);
cli.init();

// Close when CLI closes.
cli.on('end', () => process.exit(0));

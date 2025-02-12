import {assert} from '@augment-vir/assert';
import {extractRelevantArgs} from '@augment-vir/node';
import {findMatchingDb} from './find.js';

const searchQuery = extractRelevantArgs({
    binName: undefined,
    fileName: import.meta.filename,
    rawArgs: process.argv,
    errorIfNotFound: true,
})[0];

assert.isDefined(searchQuery, 'Missing search query string.');

await findMatchingDb(searchQuery);

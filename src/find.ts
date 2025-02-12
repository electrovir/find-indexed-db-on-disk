import {check} from '@augment-vir/assert';
import {log} from '@augment-vir/common';
import {interpolationSafeWindowsPath, runShellCommand} from '@augment-vir/node';
import {getAllIndexedDbPaths} from './file-paths.js';

export async function findMatchingDb(searchQuery: string) {
    const allPaths = await getAllIndexedDbPaths();

    if (!check.isLengthAtLeast(allPaths, 1)) {
        log.warning('No databases were found.');
        return undefined;
    }

    log.faint(`Found ${allPaths.length} possible databases...`);

    const allDumps = await Promise.all(allPaths.map(async (dbPath) => dumpSqliteDatabase(dbPath)));

    const filtered = allDumps.filter(({dump}) => dump.includes(searchQuery));

    log.faint(`Found ${filtered.length} matches:`);

    filtered.forEach(({path}) => {
        log.info(path);
        // log.faint('    ' + dump);
    });
}

async function dumpSqliteDatabase(dbPath: string) {
    const {stdout} = await runShellCommand(
        `sqlite3 '${interpolationSafeWindowsPath(dbPath)}' .dump`,
        {
            rejectOnError: true,
        },
    );

    return {
        path: dbPath,
        dump: stdout,
    };
}

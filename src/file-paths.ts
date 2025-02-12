import type {MaybePromise} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {readdir, stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';

// /Users/electrovir/Library/Containers/com.apple.Safari/Data/Library/WebKit/WebsiteDataStore

const userDirectory = homedir();

export const searchDirectories = [
    /** Safari on macOS 15.3 */
    join(
        userDirectory,
        'Library',
        'Containers',
        'com.apple.Safari',
        'Data',
        'Library',
        'WebKit',
        'WebsiteDataStore',
    ),
];

async function getSafariIndexedDbPaths(): Promise<string[]> {
    const baseSafariPath = join(
        userDirectory,
        'Library',
        'Containers',
        'com.apple.Safari',
        'Data',
        'Library',
        'WebKit',
        'WebsiteDataStore',
    );

    const allPaths: string[] = (
        await mapChildren(
            baseSafariPath,
            async (
                /** At least, I think that's what these are, Safari profile hashes. */
                profileHashPath,
            ) => {
                return await mapChildren(
                    join(profileHashPath, 'Origins'),
                    async (originHashPath) => {
                        return await mapChildren(originHashPath, async (subOriginHashPath) => {
                            return await mapChildren(
                                join(subOriginHashPath, 'IndexedDB'),
                                (indexedDbDirPath) => {
                                    return join(indexedDbDirPath, 'IndexedDB.sqlite3');
                                },
                            );
                        });
                    },
                );
            },
        )
    ).flat(3);

    return allPaths;
}

export async function getAllIndexedDbPaths(): Promise<string[]> {
    return [
        ...(await getSafariIndexedDbPaths()),
    ];
}

async function mapChildren<T>(
    path: string,
    callback: (path: string) => MaybePromise<T>,
): Promise<T[]> {
    if (!existsSync(path) || !(await stat(path)).isDirectory()) {
        return [];
    }

    const children = await readdir(path);

    return await Promise.all(
        children.map(async (child) => {
            return await callback(join(path, child));
        }),
    );
}

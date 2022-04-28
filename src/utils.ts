import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

export const run = promisify(exec);
export const exists = fs.existsSync;

export function rmdir(dir: string): Promise<void> {
	return fs.promises.rm(dir, { recursive: true });
}

// TODO: throw if non-zero
export const git = (...args: string[]) => run(`git ${args.join(' ')}`);

export function toRemote(remote: string): string {
	let idx = remote.lastIndexOf('#');
	if (idx === -1) return remote;

	let plain = remote.substring(0, idx++);
	let branch = remote.substring(idx);
	return `-b ${branch} ${plain}`;
}

// @see https://stackoverflow.com/a/52269934/3577474
export async function sparse(remote: string, dest: string, subdir: string) {
	await git('clone --depth 1 --filter=blob:none --sparse', toRemote(remote), dest);
	await run(`git sparse-checkout set "${subdir}"`, { cwd: dest });
}

export async function clone(remote: string, dest: string) {
	await git('clone --depth 1', toRemote(remote), dest);
}

export async function cleanup(target: string, init: boolean) {
	await rmdir(
		join(target, '.git')
	);
	if (init) {
		await git('init -b main', target);
	}
}

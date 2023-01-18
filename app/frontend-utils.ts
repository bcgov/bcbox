// This script attempts to gracefully rebuild and update bcbox-frontend if necessary
/* eslint-disable no-console */
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs';
import { basename, join } from 'path';

const FRONTEND_DIR = '../frontend';
const DIST_DIR = 'dist';
const TITLE = 'bcbox-frontend';

try {
  const args = process.argv.slice(2);
  switch (args[0]) {
    case 'build':
      buildComponents();
      break;
    case 'clean':
      cleanComponents();
      break;
    case 'deploy':
      deployComponents();
      break;
    case 'purge':
      console.log(`Purging "${DIST_DIR}"...`);
      if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true });
      break;
    default:
      if (!existsSync(DIST_DIR) || !readdirSync(DIST_DIR).length) {
        console.log(`${TITLE} not found under "${DIST_DIR}"`);
        buildComponents();
        deployComponents();
      } else if (statSync(DIST_DIR).mtime < statSync(FRONTEND_DIR).mtime) {
        console.log(`${TITLE} "${FRONTEND_DIR}" directory has been modified`);
        buildComponents();
        deployComponents();
      } else {
        console.log(`${TITLE} is present and up to date`);
      }
  }
} catch (err) {
  console.log(`An error occured while managing ${TITLE}`);
  process.exit(1);
}

//
// Task Functions
//

/**
 * @function buildComponents
 * @description Rebuild `bcbox-frontend` library
 */
function buildComponents() {
  if (!existsSync(`${FRONTEND_DIR}/node_modules`)) {
    console.warn(`${TITLE} missing dependencies. Reinstalling...`);
    runSync('npm ci', FRONTEND_DIR);
  }
  console.log(`Rebuilding ${TITLE}...`);
  runSync('npm run build', FRONTEND_DIR);
  console.log(`${TITLE} has been rebuilt`);
}

/**
 * @function cleanComponents
 * @description Clean `bcbox-frontend` library directory
 */
function cleanComponents() {
  console.log(`Cleaning ${TITLE}...`);
  runSync('npm run clean', FRONTEND_DIR);
  console.log(`${TITLE} has been cleaned`);
}

/**
 * @function deployComponents
 * @description Redeploy `bcbox-frontend` library
 */
function deployComponents() {
  console.log(`Redeploying ${TITLE}...`);
  if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true });
  copyDirRecursiveSync(`${FRONTEND_DIR}/${DIST_DIR}`, '.');
  console.log(`${TITLE} has been redeployed`);
}

//
// Helper Functions
//

/**
 * @function runSync
 * @description Execute a single shell command where `cmd` is a string
 * @param {string} cmd Shell command to run
 * @param {string} [cwd] Working directory of the command to run
 */
export function runSync(cmd: string, cwd: string | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { spawnSync } = require('child_process');
  const parts = cmd.split(/\s+/g);
  const opts = {
    cwd: cwd || undefined,
    stdio: 'inherit',
    shell: true
  };

  const p = spawnSync(parts[0], parts.slice(1), opts);
  if (p.status) {
    throw new Error(`Command "${cmd}" exited with status code "${p.status}"`);
  }
  if (p.signal) {
    throw new Error(`Command "${cmd}" exited with signal "${p.signal}"`);
  }
}

/**
 * @function copyFileSync
 * @description Copies `source` file to `target` file
 * @param {string} source Source file location
 * @param {string} target Target file location
 */
export function copyFileSync(source: string, target: string) {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (existsSync(target)) {
    if (lstatSync(target).isDirectory()) {
      targetFile = join(target, basename(source));
    }
  }

  writeFileSync(targetFile, readFileSync(source));
}

/**
 * @function copyDirRecursiveSync
 * @description Recursively copies `source` directory contents to `target` directory
 * @param {string} source Source directory location
 * @param {string} target Target directory location
 */
export function copyDirRecursiveSync(source: string, target: string) {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = join(target, basename(source));
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder, { recursive: true });
  }

  // Copy
  if (lstatSync(source).isDirectory()) {
    files = readdirSync(source);
    files.forEach(file => {
      const curSource = join(source, file);
      if (lstatSync(curSource).isDirectory()) {
        copyDirRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

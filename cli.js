#!/usr/bin/env node
import { program, Option } from 'commander'
import { execaCommand } from 'execa'
import fastglob from 'fast-glob'
import mustache from 'mustache'
import tasuku from 'tasuku'
import chalk from 'chalk'
import pmap from 'p-map'
import fs from 'node:fs/promises'
import path from 'node:path'

const { version } = JSON.parse(
  await fs.readFile(new URL('./package.json', import.meta.url), 'utf8')
)
const debug = process.env.CLI_ENV === 'debug'

program
  .name('findx')
  .description('CLI to find and execute command for every glob match')
  .usage('<globs> [options] -- [commands...]')
  .argument('<globs>', 'globs to match')
  .argument('[commands...]', 'commands to execute')
  .option('-C, --concurrent <max>', 'concurrent number of executions', 10)
  .addOption(
    new Option('--log <level>', 'log level')
      .choices(['stdout', 'stderr', 'all', 'none'])
      .default('all')
  )
  .option('--sh', 'run each execution in new shell')
  .option('--cd', 'change to path directory for each run')
  .version(version)
  .parse()

const opts = program.opts()
const globs = program.args[0].split(' ')
const cmd = program.args.slice(1).join(' ')
if (debug) {
  console.log(opts, globs, cmd)
  process.exit()
}

opts.concurrent = parseInt(opts.concurrent, 10)
if (opts.concurrent < 1) program.error('error: --concurrent must be >= 1')

const matches = (await fastglob(globs)).sort()
if (!matches.length) program.error('error: no matches found')
if (!cmd) {
  for (const i of matches) console.log(i)
  process.exit()
}

mustache.escape = (noop) => noop
const exe = async (match) => {
  const spawn = await execaCommand(
    mustache.render(cmd, {
      path: match,
      ...path.parse(match)
    }),
    {
      all: true,
      reject: false,
      ...(opts.sh && { shell: true }),
      ...(opts.cd && { cwd: path.dirname(match) })
    }
  )
  const { exitCode: err, escapedCommand: esc, [opts.log]: log } = spawn
  const { red: r, green: g, gray: y } = chalk
  console.log(`${err ? r('✖') : g('✔')} ${y(esc)}${log ? `\n${log}` : ''}`)
  return err
}

let count = 0
const exetty = async (match) => {
  const task = await tasuku(`[${++count}/${matches.length}] ${match}`, () =>
    exe(match)
  )
  task.clear()
  return task.result
}

const run = await pmap(matches, process.stdout.isTTY ? exetty : exe, {
  concurrency: opts.concurrent
})
if (run.some((r) => r)) process.exit(1)

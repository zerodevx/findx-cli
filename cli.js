#!/usr/bin/env node
import { program } from 'commander'
import { execaCommand } from 'execa'
import fastglob from 'fast-glob'
import mustache from 'mustache'
import tasuku from 'tasuku'
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
  .option('-S, --shell', 'run each execution in new shell')
  .option('-d, --cd', 'change to path directory for each run')
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

let errflag
mustache.escape = (noop) => noop

const run = (match) =>
  execaCommand(
    mustache.render(cmd, {
      path: match,
      ...path.parse(match)
    }),
    {
      all: true,
      reject: false,
      ...(opts.shell && { shell: true }),
      ...(opts.cd && { cwd: path.dirname(match) })
    }
  ).then(({ exitCode, command, all }) => {
    if (exitCode) errflag = true
    console.log(`${exitCode ? '✖' : '✔'} ${command}\n${all}`)
  })

const runtty = (match) => tasuku(match, () => run(match)).then(({ clear }) => clear())

await pmap(matches, process.stdout.isTTY ? runtty : run, {
  concurrency: opts.concurrent
})

if (errflag) process.exit(1)

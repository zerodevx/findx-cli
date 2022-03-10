import test from 'ava'
import { execaSync } from 'execa'

const run = (...args) => execaSync('node', ['cli.js', ...args])

test('matches', (t) => {
  const { stdout } = run('test/**/*.txt')
  t.true(stdout.includes('fixtures/dummy.txt'))
  t.true(stdout.includes('fixtures/c/dummy.txt'))
})

test('concurrency', (t) => {
  const { stdout } = run(
    '-C',
    '2',
    'test/**/*.txt',
    'node',
    'test/helpers/mock.js',
    'concurrent',
    '{{dir}}'
  )
  const out = stdout.split('slow')
  t.true(out[0].length > out[1].length)
})

test('error', (t) => {
  const err = t.throws(() =>
    run(
      '-C',
      '2',
      'test/**/*.txt',
      'node',
      'test/helpers/mock.js',
      'error',
      '{{dir}}'
    )
  )
  t.is(err.stdout.split('done').length, 5)
})

test('logs', (t) => {
  const run2 = (...args) =>
    t.throws(() =>
      run(
        ...args,
        'test/fixtures/dummy.txt',
        'node',
        'test/helpers/mock.js',
        'logs'
      )
    )
  const { stdout: all } = run2()
  t.true(all.includes('test-stdout') && all.includes('test-stderr'))
  const { stdout } = run2('--log', 'stdout')
  t.true(stdout.includes('test-stdout') && !stdout.includes('test-stderr'))
  const { stdout: stderr } = run2('--log', 'stderr')
  t.true(!stderr.includes('test-stdout') && stderr.includes('test-stderr'))
  const { stdout: none } = run2('--log', 'none')
  t.true(!none.includes('test-stdout') && !none.includes('test-stderr'))
})

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
    run('-C', '2', 'test/**/*.txt', 'node', 'test/helpers/mock.js', 'error', '{{dir}}')
  )
  t.is(err.stdout.split('done').length, 5)
})

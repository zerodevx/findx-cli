const sleep = (t) => new Promise((r) => setTimeout(r, t))
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const args = process.argv.slice(2)

switch (args[0]) {
  case 'concurrent': {
    switch (args[1]) {
      case 'test/fixtures/a': {
        await sleep(1000)
        console.log('slow')
        break
      }
      default: {
        await sleep(100)
        console.log('fast')
      }
    }
    break
  }
  case 'error': {
    switch (args[1]) {
      case 'test/fixtures/a': {
        await sleep(100)
        throw new Error('testerror')
      }
      default: {
        await sleep(200)
        console.log('done')
      }
    }
    break
  }
  default: {
    const r = rand(1, 10)
    await sleep(r * 1000)
    console.log(r)
  }
}

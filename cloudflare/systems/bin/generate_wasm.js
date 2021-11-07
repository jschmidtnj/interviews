// const cryo = require('cryo')
const fs = require('fs')
const path = require('path')
const v8 = require('v8')
const util = require('util')
require('../src/wasm_exec')

const inputFile = path.resolve(__dirname, '../dist/static/dist.wasm')
const outputFile = path.resolve(__dirname, '../dist/static/dist.buffer')

const main = async () => {
  const go = new Go();
  let data = fs.readFileSync(inputFile)
  console.log(data)
  let obj = await WebAssembly.compile(data)
  console.log(obj)
  // let instantiated = await WebAssembly.instantiate(obj, go.importObject)
  // await go.run(instantiated);
  // console.log(await util.promisify(index)())
  console.log(instantiated)

  const frozen = v8.serialize(obj)
  console.log(frozen)

  fs.writeFileSync(outputFile, frozen)

  data = fs.readFileSync(inputFile)
  instantiated = v8.deserialize(data)
  // instantiated = await WebAssembly.instantiate(obj)
  console.log(instantiated)
}

if (require.main === module) {
  main().then(() => console.log('done')).catch(console.error)
}

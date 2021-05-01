#!/usr/bin/env node

const meow = require('meow')
const ct = require('./cidtree')

const cli = meow(`
Usage 
  $ codcli [.|files|dir] [options]
  # codcli is a command line utility that helps you find/check/keep track/ of your files added on IPFS
  # . is default files dir

Options 
  cidVersion = [0,1] default=1
  debug = [true|false] default=false
  
Example
  $ codcli bla bla bla
`, {
  flags: {
    cidVersion: {
      type: 'number',
      default: 1
    },
    debug: {
      type: 'boolean',
      default: false
    },
    showCid: {
      type: 'boolean',
      default: true
    },
    showNumOfProvs: {
      type: 'boolean',
      default: true
    }
  }
})

function main(cli) {
  ct.explore(cli.input, cli.flags)
}

main(cli)
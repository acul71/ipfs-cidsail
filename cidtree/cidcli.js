#!/usr/bin/env node

const meow = require('meow')
const ct = require('./cidtree')

const cli = meow(`
USAGE
  cidcli file... - Check if a file is in IPFS

SYNOPSIS
  cidcli [--cidVersion=1] [--debug=false] [--showCid=true] [--showNumOfProvs=true] [--verbose=0] <[.| files | dir]>
  
ARGUMENTS
  . = current dir ('.' can be omitted)
  file(s) = list of file(s)
  directory(s) = list of directory(s)

OPTIONS 
  --cidVersion = [0,1] default=1 - cidVersion to show (0 old, 1 new)
  --debug = [true|false] default=false - Show debug (errors) info
  --showCid = [true|false] default=true - Show cid
  --showNumOfProvs = [true|false] default=true - Show number of peers that can provide a specific cid
  --verbose = [0,1,2] default=0 - Show additional info about peers
DESCRIPTION
  cidcli is a command line utility that helps you find/check/keep track/ of your files added on IPFS

EXAMPLES
  echo "hello world!" > test.txt
  cidcli test.txt

  test.txt CID(bafybeihp35x7qe7hn7g4eirzmb6dqnbw5z7x6kgko2ks4jzf5geqoirysy) PROVS=3

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
    },
    verbose: {
      type: 'number',
      default: 0
    }
  }
})

function main(cli) {
  ct.explore(cli.input, cli.flags)
}

main(cli)
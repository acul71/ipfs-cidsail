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
  dir(s) = list of directory(s)

OPTIONS 
  --ipfsUrl, -iu = [URL] default='' aka http://localhost:5001/api/v0 - A URL that resolves to a running instance of the IPFS HTTP API
  --cidVersion, -c = [0,1] default=1 - cidVersion to show (0 old, 1 new)
  --debug, -d = [true|false] default=false - Show debug (errors) info
  --showCid, -sc = [true|false] default=true - Show cid
  --showNumOfProvs, -sp = [true|false] default=true - Show number of peers that can provide a specific cid
  --provsTimeout, -pt = [milliseconds] default=1500 - Number of milliseconds to find providers
  --verbose, -v = [0,1,2] default=0 - Show additional info about peers
  --ignoreHidden, -ih = [true|false] default=false - Ignore files and dirs name that have '.' as first char

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
      alias: 'c',
      default: 1
    },
    debug: {
      type: 'boolean',
      alias: 'd',
      default: false
    },
    showCid: {
      type: 'boolean',
      alias: 'sc',
      default: true
    },
    showNumOfProvs: {
      type: 'boolean',
      alias: 'sp',
      default: true
    },
    verbose: {
      type: 'number',
      alias: 'v',
      default: 0
    },
    ipfsUrl: {
      type: 'string',
      alias: 'iu',
      default: ''
    },
    ignoreHidden: {
      type: 'boolean',
      alias: 'ih',
      default: false
    },
    provsTimeout: {
      type: 'number',
      alias: 'pt',
      default: 1500
    },
  }
})

function main(cli) {
  ct.explore(cli.input, cli.flags)
}

main(cli)
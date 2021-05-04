#!/usr/bin/env node

const meow = require('meow')
const ct = require('./cidtree')
/*
USAGE
  ipfs ls <ipfs-path>... - List directory contents for Unix filesystem objects.

SYNOPSIS
  ipfs ls [--headers | -v] [--resolve-type=false] [--size=false] [--stream | -s] [--] <ipfs-path>...

ARGUMENTS

  <ipfs-path>... - The path to the IPFS object(s) to list links from.

OPTIONS

  -v, --headers   bool - Print table headers (Hash, Size, Name).
  --resolve-type  bool - Resolve linked objects to find out their types. Default: true.
  --size          bool - Resolve linked objects to find out their file size. Default: true.
  -s, --stream    bool - Enable experimental streaming of directory entries as they are traversed.

DESCRIPTION

  Displays the contents of an IPFS or IPNS object(s) at the given path, with
  the following format:
  
    <link base58 hash> <link size in bytes> <link name>
  
  The JSON output contains type information.




*/
const cli = meow(`
USAGE
  cidcli file... - Check if a file is in IPFS

SYNOPSIS
  cidcli [--cidVersion=1] [debug=false] <[.| files | dir]>
  

ARGUMENTS
  . = current dir ('.' can be omitted)
  file(s) = list of file(s)
  directory(s) = list of directory(s)

OPTIONS 
  cidVersion = [0,1] default=1
  debug = [true|false] default=false

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
    }
  }
})

function main(cli) {
  ct.explore(cli.input, cli.flags)
}

main(cli)
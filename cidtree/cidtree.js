#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const counts = { dirs: 0, files: 0 }

const utils = require('../lib/utils')
//import { getCID, findProvs } from '../lib/utils'

const ERROR = " 🛑ERROR"

let DEBUG = false

const walk = async (directory, prefix, showCID=true, showNumOfProvs=true) => {
  try {
    // https://itnext.io/why-async-await-in-a-foreach-is-not-working-5f13118f90d
    //fs.readdirSync(directory, { withFileTypes: true }).forEach( async (file, index, files) => { 
    const files = fs.readdirSync(directory, { withFileTypes: true })
    for (let index = 0; index < files.length; index++) {
      const file = files[index]

      if (file.name.charAt(0) != ".") {
        process.stdout.write('\n')
        const parts = index == files.length - 1 ? ["└── ", "    "] : ["├── ", "│   "]
        process.stdout.write(`${prefix}${parts[0]}${file.name}`)
        
        // TOFIX: Links doesn't work
        if (file.isFile()) {
          const filePath = path.join(directory, file.name)
          //console.log(filePath)
          
          const cid = await utils.getCID(filePath)
          
          if (showCID) {    
            process.stdout.write(' CID(' + cid + ')')
          }

          if (showNumOfProvs && cid !== null) {
            const provs = await utils.findProvs(cid)
            process.stdout.write(` PROVS=${provs.length}`)
            //console.log(' PROVS=', provs)
          }
        }

        if (file.isDirectory()) {
          counts.dirs += 1
          await walk(path.join(directory, file.name), `${prefix}${parts[1]}`, showCID, showNumOfProvs)
        } else {
          counts.files += 1
        }
      }
    }
  } catch(err) {
    if (DEBUG) {
      console.log(err)
    } else {
      process.stdout.write(ERROR)
    }
  }
}

const walkRun = async () => {
  const directory = process.argv[2] || ".";
  process.stdout.write(directory)

  await walk(directory, "")
  console.log(`\n${counts.dirs} directories, ${counts.files} files`)
}

walkRun()



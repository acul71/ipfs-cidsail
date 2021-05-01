#!/usr/bin/env node

const fs = require("fs")
const path = require("path")


const counts = { dirs: 0, files: 0 }

const utils = require('../lib/utils')
//import { getCID, findProvs } from '../lib/utils'

const ERROR = " 🛑ERROR"

let DEBUG = true

const getFileInfo = async (filePath, options) => {
  const cid = await utils.getCID(filePath)
  if (options.showCid) {    
    process.stdout.write(' CID(' + cid + ')')
  }

  if (options.showNumOfProvs && cid !== null) {
    const provs = await utils.findProvs(cid)
    process.stdout.write(` PROVS=${provs.length}`)
    //console.log(' PROVS=', provs)
  }
}

const walk = async (directory, prefix, options = { showCid:true, showNumOfProvs:true, debug:DEBUG }) => {
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
        
        // TOFIX: Links don't works
        if (file.isFile()) {
          const filePath = path.join(directory, file.name)
          //console.log(filePath)
          await getFileInfo(filePath, options)
        }

        if (file.isDirectory()) {
          counts.dirs += 1
          await walk(path.join(directory, file.name), `${prefix}${parts[1]}`, options)
        } else {
          counts.files += 1
        }
      }
    }
  } catch(err) {
    if (options.debug) {
      console.log(err)
    } else {
      process.stdout.write(ERROR)
    }
  }
}

const walkRun = async (directory, options) => {
  //const directory = process.argv[2] || ".";
  process.stdout.write(directory)
  
  await walk(directory, "", options)
  console.log(`\n${counts.dirs} directories, ${counts.files} files\n`)
}

//walkRun()

const explore = async (files = [], options) => {
  if (files.length == 0) files[0] = '.'
  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    //console.log(file)
    if (fs.existsSync(file)) {
      const stat = fs.statSync(file)
      if (stat.isFile()) {
        process.stdout.write(file)
        await getFileInfo(file, options)
        console.log('\n')
      } else if (stat.isDirectory()) {
        await walkRun(file, options)
      }
    } else {
      console.log(`${file}: don't exists`)
    }

  }
}

exports.explore = explore
exports.walk = walk
exports.getFileInfo = getFileInfo



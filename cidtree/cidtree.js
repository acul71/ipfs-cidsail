#!/usr/bin/env node

const fs = require("fs")
const stats = require("ipfs-http-client/src/stats")
const path = require("path")
const FileType = require('file-type')
const { Table } = require("console-table-printer");

const utils = require('../lib/utils')

const counts = { dirs: 0, files: 0 }


// Some emoji
const ERROR = '🛑ERROR'
const HOME = '🏠'


// ipfsID of server
let ipfsID = null
// cidStats a structure that holds parsed cid stats/info
const cidStats = []

//
// Show stats 
//
const statsView = (cidStats = [], options) => {
  console.log()
  console.log('----------------------------------------------------------------------------------------------------------------------------------------')
  console.log()
  
  let cidWithProvs = 0
  let cidWithoutProvs = 0

  const p = new Table({
    columns: [
      { name: "CID", alignment: "left" },
      { name: "Files path", alignment: "left", maxLen: 50 },
      { name: "File type", alignment: "center" },
      { name: "File size", alignment: "right" },
      { name: "Provs", alignment: "right" },
      { name: 'HOME', alignment: "center" },
    ],
  })

  cidStats.map( (k) => {
    //console.log(k.provsInfo.length)
    if (k.provsInfo.length === 0) {
      cidWithoutProvs++
    } else {
      cidWithProvs++
    }
    p.addRow(
      {
        'CID': k.cid,
        'Files path': k.filesInfo.filesPath.join(' '),
        'File type': k.filesInfo.fileType.mime,
        'File size': k.filesInfo.fileSize,
        'Provs': k.provsInfo.length,
        'HOME': k.provHome ? HOME : '-'
      }
    )
    console.log(`${k.cid}\t${k.filesInfo.filesPath.join(' ')}\t${k.filesInfo.fileType.mime}\t${k.filesInfo.fileSize}\t${k.provsInfo.length}\t${k.provHome}`)
  })
  
  console.log()
  console.log('----------------------------------------------------------------------------------------------------------------------------------------')
  console.log()
  
  // print
  p.printTable();
  
  console.log('cidWithProvs=', cidWithProvs)
  console.log('cidWithoutProvs=', cidWithoutProvs)
  
  console.log()
  console.log('----------------------------------------------------------------------------------------------------------------------------------------')
  console.log()

  //console.dir(cidStats, { depth: null })
  if (options.debug) {
  //if (true) {
    console.log(JSON.stringify(cidStats, undefined, 2))
  }
}

//
// Get file Info (CID, PROVS, FILE PATH and SIZE and TYPE)
//
const getFileInfo = async (filePath, options) => {
  // Get CID
  const cid = await utils.getCID(filePath, cidVersion=options.cidVersion)
  if (options.showCid) {    
    process.stdout.write(' CID(' + cid + ')')
  }

  // Get file type
  let fileType = await FileType.fromFile(filePath)
  //console.log('fileType=',fileType)
  if (fileType === undefined) {
    // TODO: Add check for not binary types
    const ext = path.extname(path.basename(filePath)).substring(1)
    fileType = { ext: ext, mime: "Not Binary?" }

  }

  // Get file size
  const stat = fs.statSync(filePath)
  if (stat.size == 0) {
    process.stdout.write(' (Size: 0)')
  }

  if (options.showNumOfProvs && cid !== null) {
    const provs = await utils.findProvs(cid, {timeout: options.provsTimeout})
    process.stdout.write(` PROVS=${provs.length}`)
    
    // Check if provider is home (is the provider in ipfsUrl)
    let provHome = false
    if (provs.length) {
      if (provs.findIndex( (prov) => prov.id == ipfsID) > -1) {
        if (options.verbose == 0) {
          process.stdout.write(' ' + HOME)
        }
        provHome = true
      }
    }

    if (options.verbose == 1) {
      if (provs.length) {
        process.stdout.write('\n')
        provs.map( (prov) => {
          home = prov.id == ipfsID ? ' ' + HOME : ''
          console.log('ID=', prov.id + home)
        })
      } 
    } else if (options.verbose == 2) {
      if (provs.length) {
        process.stdout.write('\n')
        //process.stdout.write(JSON.stringify(provs))
        console.log(provs)
      }
    }
    //if (options.stats) {
    if (true) {
      const cidIdx = cidStats.findIndex( (cidS) => cidS.cid == cid)
      // If cid is not found add it
      if (cidIdx == -1) {
        cidStats.push({
          cid: cid,
          filesInfo: {filesPath: [filePath], fileType: fileType, fileSize: stat.size},
          provsInfo: provs,
          provHome: provHome
        })
      } else { 
        const fileIdx = cidStats[cidIdx].filesInfo.filesPath.findIndex( (fileP) => fileP == filePath)
        // If filePath is not found add filePath in files list (filesInfo.filesPath)
        if (fileIdx == -1) {
          cidStats[cidIdx].filesInfo.filesPath.push(filePath)
        }
      }
    }
  }
}


//
// Walk directory looking for files
//
const walk = async (directory, prefix, options = { cidVersion:1, showCid:true, showNumOfProvs:true, debug:false }) => {
  try {
    // https://itnext.io/why-async-await-in-a-foreach-is-not-working-5f13118f90d
    //fs.readdirSync(directory, { withFileTypes: true }).forEach( async (file, index, files) => { 
    const files = fs.readdirSync(directory, { withFileTypes: true })
    for (let index = 0; index < files.length; index++) {
      const file = files[index]

      if (options.ignoreHidden && file.name.charAt(0) === ".") {
        continue
      }
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
  } catch(err) {
    if (options.debug) {
      console.log(err)
    } else {
      process.stdout.write(' ' + ERROR)
    }
  }
}

const walkRun = async (directory, options) => {
  process.stdout.write(directory)
  await walk(directory, "", options)
}


//
// explore a files list 
//
const explore = async (files = [], options) => {
  // Set ipfs server URL
  const url = options.ipfsUrl == '' ? {} : options.ipfsUrl
  utils.ipfsInit(url)
  
  // Get ipfsID
  ipfsID = await utils.ipfsID()
  console.log('Local ipfs server ID=', ipfsID)

  // Testing pins
  //pinLs = await utils.ipfsPinLs()
  //console.log('pinLs=', pinLs)
  //console.log('pinLs=', pinLs[0].cid)

  // if no files or dirs set cur dir '.'
  if (files.length == 0) files[0] = '.'
  
  console.log()
  
  // Parse all the input files
  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    //console.log(file)
    if (fs.existsSync(file)) {
      const stat = fs.statSync(file)
      if (stat.isFile()) {
        process.stdout.write(file)
        await getFileInfo(file, options)
        console.log('\n')
        counts.files += 1
      } else if (stat.isDirectory()) {
        await walkRun(file, options)
        console.log('\n')
      }
    } else {
      console.log(`${file}: don't exists`)
    }
  }
  
  console.log(`${counts.dirs} directories, ${counts.files} files\n`)
  
  // CID Stats
  //if (options.stats) {
  if (true) {
    statsView(cidStats, options)
    //console.log(cidStats)
  }  
}

exports.explore = explore
exports.walk = walk
exports.getFileInfo = getFileInfo



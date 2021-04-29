const fs = require('fs')
const Hash = require('ipfs-only-hash')

const IpfsHttpClient = require('ipfs-http-client')

//const { get } = require('lodash')
//const { urlSource } = IpfsHttpClient

const ipfs = IpfsHttpClient()

/**
* Returns the hash (CID) of file
* @param    filePath      file to encode.
* @param    cidVersion    cidVersion (0,1).
* @returns  {Promise}     Promise object represents hash of data (CID). null if it fails.
*/
async function getCID(filePath, cidVersion = 1) {
  const options = { cidVersion: cidVersion }
  let hash
  
  // get file data
  const stream = fs.createReadStream(filePath)

  try {
    hash = await Hash.of(stream, options)
  } catch(err) {
    console.log(err)
    hash = null
  }
  
  return hash
}

/**
* Returns array of provider for CID
* @param    CID           CID (hash).
* @param    options       ipfs.dht.findProvs options. Default options = { timeout: 10000}
* @returns  {Promise}     Promise object represents array of providers for CID.
*/
async function findProvs(CID, options = { timeout: 1000}) {
  const providers = ipfs.dht.findProvs(CID, options)

  const provs = []
  for await (const provider of providers) {
    //console.log('provider=', provider.id.toString())
    provs.push(provider)
    //console.log('provider=', provider)
  }
  return provs
}

exports.getCID = getCID
exports.findProvs = findProvs 


/* TEST
async function checkFile(filePath) {
  // get file data
  const stream = fs.createReadStream(filePath)

  // compute file hash
  const CID = await getCID(stream)
  console.log(`CID('${filePath}') = ${CID}`)

  // find provs of file
  if (CID !== null) {
    console.time('provs')
    const provs = await findProvs(CID)
    console.timeEnd('provs')
    console.log('provs=', provs.length)
  }
  

}
*/

//TEST
//checkFile('/home/luca/Videos/Bocciodromo 2020.avi')
//checkFile('/tmp/ipfs-logo.svg')
//checkFile('/tmp/')

/*
async function TEST() {
  await checkFile('/home/luca/Videos/Bocciodromo 2020.avi')
  await checkFile('/tmp/ipfs-logo.svg')
  await checkFile('/tmp/')
}

TEST()

*/
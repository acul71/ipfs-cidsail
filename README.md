# ipfs-cidsail
A command line utility that helps you find/check/keep track/ of your files published on IPFS. A gui interface and a library would be nice too.

### Try it
```bash
git clone https://github.com/acul71/ipfs-cidsail
cd ipfs-cidsail
npm install
node cidtree/cidcli.js
```

### Description
This project is about a tool that helps you find/check/keep track of files published on IPFS.
Something that compares filesystems to either local IPFS datastore and/or network availability
If you got a file and want to see if is has been published on IPFS

To be done:
- "keeps track of what you do" - this is something that doesn't really exist yet, except for the IPFS webui, which is very basic. nothing really for bulk views of files, across different media types, date ranges, good and fast indexing/searching, etc.
- developer and publishing workflows. or video/photography workflows, managing lots of assets for publication.
- visual diff and migration tools would be cool. also just better tools for managing the collections, easily moving data/files into and out of IPFS (whether local or remote - both have different use-cases)

### How is made
This project uses the IPFS javascript libraries. 
This are the libraries used:
{
  "dependencies": {
    "file-type": "^16.4.0",
    "ipfs-http-client": "^49.0.4",
    "ipfs-only-hash": "^4.0.0",
    "meow": "^9.0.0"
  }
}
- file-type: Detect the file type
- ipfs-http-client : An interface (client) to ipfs daemon
- ipfs-only-hash: A small utility to get a hash of a file without add it to IPFS
- meow: cli utility

It is written in javascript (nodejs). 
It's a command line utility. 

### TODO
 I'm planning to write a GUI using react for a better user experience managing adding files and visualize stats and data.

- complete stats 
- pin list
- mfs ?
- codcli version
- chalk colors
- fix different provs for same cid (sometimes)?
- ignore file from list or glob
- list of files from a file
- documentation
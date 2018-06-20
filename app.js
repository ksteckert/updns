const fs = require('fs')
const path = require('path')
const updns = require('updns').createServer(53, '127.0.0.3')

var hostsFile = path.resolve('./hosts')
var hosts

function updateHosts () {
  let regs = fs.readFileSync(hostsFile, 'utf8')
  hosts = regs.split("\n").filter(Boolean).map(r => new RegExp(r, 'gi'))
  // console.log(hosts)
}

updateHosts()
fs.watchFile(hostsFile, updateHosts)

updns.on('error', error => {
  console.log(error)
})

updns.on('listening', server => {
  console.log('DNS service has started')
})

updns.on('message', (domain, send, proxy) => {
  let match = false

  hosts.forEach(h => {
    if (domain.match(h)) match = true
  })

  if(match){
    send('127.0.0.1')
  }else {
    proxy('8.8.8.8')
  }
})

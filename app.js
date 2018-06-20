const path = require('path')
const fs = require('fs')

var {bind = '', hosts:hostsFile = path.resolve('./hosts')} = require('minimist')(process.argv.slice(2))
var binding = bind.split(':').filter(Boolean)

const updns = require('updns').createServer(binding[1], binding[0])
var hosts

function updateHosts () {
  let regs = fs.readFileSync(hostsFile, 'utf8')
  hosts = regs.split("\n").filter(Boolean).map(r => new RegExp(r, 'gi'))
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

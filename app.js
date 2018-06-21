const path = require('path')
const fs = require('fs')

var {bind = '', hosts:hostsFile = path.resolve('./hosts')} = require('minimist')(process.argv.slice(2))
var binding = bind.split(':').filter(Boolean)

const updns = require('updns').createServer(binding[1], binding[0])
var hosts

function updateHosts () {
  let regs = fs.readFileSync(hostsFile, 'utf8')
  hosts = regs.split("\n").filter(Boolean).map(r => {
    let rowArray = r.trim().replace(/\s\s+/g, ' ').split(' ')
    return {
      pattern: new RegExp(rowArray[0], 'gi'),
      host: rowArray[1]
    }
  })
  console.log(hosts)
  // hosts = regs.split("\n").filter(Boolean).map(r => new RegExp(r, 'gi'))
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
  let urlHost = null

  hosts.some(r => {
    if (domain.match(r.pattern)) {
      urlHost = r.host
      return true
    }
  })

  if(urlHost){
    send(urlHost)
  }else {
    proxy('8.8.8.8')
  }
})

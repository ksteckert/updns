const updns = require('updns').createServer(53, '127.0.0.2')
 
updns.on('error', error => {
    console.log(error)
})
 
updns.on('listening', server => {
    console.log('DNS service has started')
})
 
updns.on('message', (domain, send, proxy) => {
    if(domain.match(/dev\.[\w\d]*analytics\.com/gi)){
        send('127.0.0.1')
    }else {
        proxy('8.8.8.8')
    }
})

const express = require('express')
const http = require('http')
const randomId = require('random-id');
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()
app.use(cors())
app.use(express.json())
// app.use(helmet)
// app.use( ( req, res, next ) =>
// {
//     const allowedOrigins = [ 'http://localhost:8080' ]
//     const { origin } = req.headers
//     if ( allowedOrigins.indexOf( origin ) > -1 )
//     {
//         res.setHeader( 'Access-Control-Allow-Origin', origin )
//     }
//     res.setHeader( 'Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH' )
//     res.setHeader( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, authorization, Access-Control-Allow-Methods' )
//     res.setHeader( 'Access-Control-Allow-Credentials', 'true' )
//     next()
// })


app.use(session({
    secret: 'new app',
}))

const normalizePort = val => {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        return val
    }
    if (port >= 0) {
        return port
    }

    return false
}

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error
    }
    const address = server.address()
    const bind =
        typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.')
            process.exit(1)
            break
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.')
            process.exit(1)
            break
        default:
            throw error
    }
}

const rooms = {}

app.post('/room', (req, res) => {
    const { socketID } = req.body
    console.log(req.session)
    if (!req.session.userID) {
        req.session.userID = randomId(20, 'aA0')
    }

    if (rooms[req.session.userID]) {
        rooms[req.session.userID][0] = socketID
    } else {
        rooms[req.session.userID] = [socketID]
    }

    console.log(req.session.userID)
    res.send(req.session.userID)
})

const server = http.createServer(app)

server.on('error', errorHandler)
server.on('listening', () => {
    const address = server.address()

    const bind =
        typeof address === 'string' ? 'pipe ' + address : 'port ' + port
    console.log(`Listening on ${bind}`)
})

const io = require('socket.io')(server)

// const clients = []

io.sockets.on('connection', socket => {
    console.log('Client connected: ' + socket.id)

    socket.on('send_full_drawing', data => {
        const newData = { ...data }
        newData.id = socket.id
        socket.broadcast.emit('get_full_drawing', newData)
    })

    socket.on('send_temp_drawing', data => {
        const newData = { ...data }
        newData.id = socket.id
        socket.broadcast.emit('get_temp_drawing', newData)
    })

    socket.on('disconnect', () =>
        console.log(`Client ${socket.id} has disconnected`)
    )
})

server.listen(port)

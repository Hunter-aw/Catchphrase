const express = require('express')
const path = require('path')
const socket = require ('socket.io')

const app = express()
const port = 8000

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))

const server = app.listen(process.env.PORT || port, () => {
    console.log(`connected on ${port}`)
})

let io = socket(server)
io.players = []
const secretWords = ['potato', 'carrot', 'jona']
let currentPlayer = 0
let turn = 0

io.on('connection', async (socket) => {
    await socket.join('hunter', () => console.log('connected'))
    socket.emit('login')

    socket.on('name', (data) => {
        console.log('name')
        socket.username = data.name
        io.players.push({name: socket.username, id: socket.id, score: 0})
        console.log(io.players)
    })

    socket.on('newTurn', () => {
        io.emit('currentPlayer', {currentPlayer: io.players[currentPlayer]})
        console.log(io.players[currentPlayer])
        io.to(io.players[currentPlayer].id).emit('secretWord', {secretWord: secretWords[currentPlayer]})
        if (!currentPlayer) {
            currentPlayer ++
        }
    })
    
    socket.on('private', (data) => {
        const numPeop = Object.keys(io.sockets.sockets).length
        console.log(socket.id)
        io.to(socket.id).emit('private_s', {numPeop : numPeop})
    })

    socket.on('disconnect', () => {
        let playerIndex = io.players.findIndex(p => p.id === socket.id)
        io.players.splice(playerIndex ,1)
    })
})





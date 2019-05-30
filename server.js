const express = require('express')
const path = require('path')
const socket = require ('socket.io')
const gamePlay = require('./server/gamePlay')

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
console.log("hay")
let db = {
    users:{},
    games: {}
}

io.on('connection', (socket) => {
    
    socket.emit('login')
    let currentGame;
    
    
    socket.on('name', (data) => {
        socket.username = data.name
        let player = new gamePlay.Player(socket.id, socket.username) 
        io.players.push(player)
        db.users[data.name] = player
        socket.emit('name', socket.username)

    })
    socket.on('new-game', (room) => {
        socket.join(room, () => console.log('connected'))
        db.users[socket.username].room = room
    })

    socket.on('join-game', (room) => {
        socket.join(room, () => console.log('connected'))
        db.users[socket.username].room = room
    })

    socket.on('startGame', (data) => {
        let game = new gamePlay.GamePlay()
        let registeredPlayersArray = Object.keys(db.users).map(c => db.users[c])
        let gamePlayers = registeredPlayersArray.filter(s => s.room === data.room)
        game.players = gamePlayers
        game.numberOfPlayers = gamePlayers.length
        db.games[data.room] = game
        currentGame = data.room    
        console.log(db)   
    })
    
    socket.on('newTurn', () => {
        io.emit('currentPlayer', {currentPlayer: db[game].players[currentPlayer]})
        io.to(io.players[currentPlayer].id).emit('secretWord', {secretWord: secretWords[currentPlayer]})
        if (!currentPlayer) {
            currentPlayer ++
        }
    })
    
    socket.on('private', (data) => {
        const numPeop = Object.keys(io.sockets.sockets).length
        io.to(socket.id).emit('private_s', {numPeop : numPeop})
    })

    socket.on('disconnect', () => {
        let playerIndex = io.players.findIndex(p => p.id === socket.id)
        io.players.splice(playerIndex ,1)
    })
})





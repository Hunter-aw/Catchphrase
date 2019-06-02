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
const secretWords = ['holder', 'potato', 'carrot', 'jona', 'mufasa', 'louie']
let currentPlayer = 0
let currentWord = 0
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
        db.users[data.name] = player
        socket.emit('name', socket.username)

    })
    socket.on('new-game', (room) => {
        socket.join(room, () => console.log('connected'))
        console.log(socket.username)
        db.users[socket.username].room = room

    })

    socket.on('join-game', (room) => {
        socket.join(room, () => console.log('connected'))
        db.users[socket.username].room = room
        if (db.games[room]) {
            db.games[room].players.push(db.users[socket.username])
        }
        socket.broadcast.emit('joined', socket.username)
    })

    socket.on('startGame', (data) => {
        let game = new gamePlay.GamePlay()
        let registeredPlayersArray = Object.keys(db.users).map(c => db.users[c])
        let gamePlayers = registeredPlayersArray.filter(s => s.room === data.room)
        game.players = gamePlayers
        game.numberOfPlayers = gamePlayers.length
        db.games[data.room] = game
        currentGame = data.room
        let score = game.players.map(p => {return {name: p.name, score: p.score}})
        io.emit('start', score)
        console.log(db)   
    })

    socket.on('newTurn', () => {
        let game = db.users[socket.username].room
        if ((db.games[game].players.length-1) === currentPlayer) {
            currentPlayer = 0
        }
        else{currentPlayer ++}
        currentWord++

        io.emit('currentPlayer', {currentPlayer: db.games[game].players[currentPlayer]})
        io.to(db.games[game].players[currentPlayer].id).emit('secretWord', {secretWord: secretWords[currentWord]})
    })

    socket.on('new_message', (data) => {
        let punctuationless = data.message.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        let finalString = punctuationless.replace(/\s{2,}/g," ").toLowerCase();
        console.log(secretWords[currentWord])
        console.log(finalString)
        let gameName = db.users[socket.username].room
        io.emit('new_message', data)

        if (finalString === secretWords[currentWord]) {
            db.games[gameName].scorePoint(data.name)
            let scores = db.games[gameName].players.map(p => {return {name: p.name, score: p.score}})
            io.emit('scores', scores)
        }
    })

    socket.on('private', () => {
        const numPeop = Object.keys(io.sockets.sockets).length
        io.to(socket.id).emit('private_s', {numPeop : numPeop})
    })

    socket.on('disconnect', () => {
        if (!socket.username) return;
        let user = db.users[socket.username]
        let index = db.games[user.room].players.findIndex(u => u.name === socket.username)
        db.games[user.room].players.splice(index, 1)
        console.log('deleting' + user.name)
        delete db.users[socket.username]
    })
})

let socket = io()
let username
let room
let currentPlayer
// Jquery triggers

$('#private').click(() => {
    socket.emit('private')
})

$('#newTurn').click(() => {
    socket.emit('newTurn')
    $('#chat').animate({scrollTop:1000});

})

$('#name').keypress((e) => {
    if (e.which === 13) {
        e.preventDefault()
        username = $('#name').val()
        socket.emit('name', {name: username})
        $('#name').remove()
    }
})
$('#messageInput').keypress((e) => {
    if (e.which === 13) {
        e.preventDefault()
        let message = $('#messageInput').val()
        socket.emit('new_message', {name: username, message: message})
        $('#messageInput').val("")
    }
})

$('#new-game').click(() => {
    if (!username) {
        username = $('#name').val()
        socket.emit('name', {name: username})
    }
    room = username + `${Math.floor(Math.random()*10)}`
    socket.emit('new-game', room)
    $('#signin').empty().append(`<div class = 'loginText'>your room name is <span class = 'emphasized'>${room}</span></div>
                        <button id = "start-game">Start Game!</button>`)
})

$('#join-game').click(() => {
    if (!username) {
        username = $('#name').val()
        socket.emit('name', {name: username})
    }
        $('#signin').empty().append(`<input class = 'loginText' id = 'joinInput' placeholder = 'enter the room name'>
                        <button id = "start-join-game">Join Game!</button>`)
})

$('.container').on('click', '#start-game', () => {
    $('#login').remove()
    socket.emit('startGame', {room: room})
})
$('.container').on('click', '#start-join-game', () => {
    socket.emit('join-game', $('#joinInput').val())
    $('#login').remove()
})

//Socket listeners
socket.on('login', (data) => {
    $('#chat').append(`<div>Everyone Can See This</div>`)
})
socket.on('private_s', (data) => {
    console.log('you got back!')
    $('#chat').append(`<div>${data.numPeop}</div>`)
})

socket.on('joined', (name) => {
    $('#chat').append(`<div> ${name} joined the game!</div>`)
})

socket.on('currentPlayer', (data) => {
    currentPlayer = data.currentPlayer.name
    $('#chat').append(
        `<div>the current player is ${data.currentPlayer.id === socket.id ? 'YOU' : currentPlayer}!</div>`
        )
})
socket.on('secretWord', (data) => {
    $('#chat').append(`<div>The secret word is ${data.secretWord}</div>`)
})

socket.on('new_message', (data) => {
    $('#chat').append(`<div><span class = ${data.name === currentPlayer ? 'turn' : 'user'}>${data.name}:</span> ${data.message}</div>`)
    $('#chat').animate({scrollTop:1000});
})

socket.on('scores', (scores) => {
    $('#scores').empty()
    scores.forEach( s => $('#scores').append(`<div>${s.name}: ${s.score} points`))
    $('#chat').append('<div class = emphisized>POINT</div>')
    if (username === currentPlayer) {
        socket.emit('newTurn')
    }
})

socket.on('start', (scores) => {
    scores.forEach( s => $('#scores').append(`<div>${s.name}: ${s.score} points`))
})

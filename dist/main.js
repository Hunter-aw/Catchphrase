let socket = io()
let username
let room
// Jquery triggers

$('#private').click(() => {
    socket.emit('private')
})

$('#newTurn').click(() => {
    socket.emit('newTurn')
})

$('#name').keypress((e) => {
    if (e.which === 13) {
        e.preventDefault()
        username = $('#name').val()
        socket.emit('name', {name: username})
        $('#name').remove()
    }
})

$('#new-game').click(() => {
    room = username + `${Math.floor(Math.random()*10)}`
    socket.emit('new-game', room)
    $('#signin').empty().append(`<div class = 'loginText'>your room name is <span class = 'emphasized'>${room}</span></div>
                        <button id = "start-game">Start Game!</button>`)
})

$('#join-game').click(() => {
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
    $('#main').append(`<div>Everyone Can See This</div>`)
})
socket.on('private_s', (data) => {
    console.log('you got back!')
    $('#main').append(data.numPeop)
})

socket.on('currentPlayer', (data) => {
    $('#main').append(
        `<div>the current player is ${data.currentPlayer.id === socket.id ? 'YOU' : data.currentPlayer.name}!</div>`
        )
})
socket.on('secretWord', (data) => {
    $('#main').append(`<div>The secret word is ${data.secretWord}</div>`)
})


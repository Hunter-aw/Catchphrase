let socket = io()
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
        socket.emit('name', {name: $('#name').val()})
        $('#name').remove()
    }
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


class GamePlay {
    constructor() {
        this.numberOfPlayers = 0
        this.currentPlayer;
        this.remainingTurns = 0
        this.players = []

    }
    addPlayer(player) {
        this.players.push(player)
    }
    scorePoint(player) {
        player.score += 10
    }
    nextTurn () {
        if(this.currentPlayer === this.players.length -1) {
            this.currentPlayer = 0
        }
        else {
            this.currentPlayer ++
        }
    }
    endGame () {
        let leadScore = 0
        let leadPlayer
        this.players.forEach(p => {
            if(p.score > leadScore)  {
                leadScore = p.score
                leadPlayer = p.name
            }
        })
        return leadPlayer
    }
}

class Player {
    constructor(id, name) {
        this.name = name
        this.score = 0
        this.id = id
        this.guesses = 5
        this.room
    }
}

module.exports = {GamePlay, Player}
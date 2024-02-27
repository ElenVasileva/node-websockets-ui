import { Game } from "./game";
import { BOT, User } from "./users";

export default class Games {
    private _gameList: Game[]
    private _firstBotGameId = 1

    constructor() {
        this._gameList = [
        ]
    }

    public addGame = (id: number, firstUser: User, secondUser: User) => {
        const game = new Game(id, firstUser, secondUser)
        this._gameList.push(game)
        console.log(`new game '${game.Id}' added`)
        return game
    }

    public getGameById(id: number) {
        return this._gameList.find((game: Game) => { return game.Id === id })
    }

    public getGameByUser(user: User) {
        const game = this._gameList.find((game: Game) => { return !game.Winner && (game.FirstUser === user || game.SecondUser === user) })
        if (game) {
            console.log(`Game with id '${game.Id}' was found, users are '${game.FirstUser.Name}' and '${game.SecondUser ? game.SecondUser.Name : 'bot'}'`)
        }
        return game
    }

    public addGameWithBot = (user: User) => {
        const game = new Game(this._firstBotGameId, user)
        game.CurrentPlayerIndex = 0
        this._firstBotGameId += 2
        this._gameList.push(game)
        console.log(`new game with bot '${game.Id}' added`)
        game.addShips(BOT, game.createRandomShips())
        return game
    }

}
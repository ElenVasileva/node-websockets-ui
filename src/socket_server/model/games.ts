import { Game } from "./game";
import { User } from "./users";

export default class Games {
    private _gameList: Game[]

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
            console.log(`Game with id '${game.Id}' was found, users are '${game.FirstUser.Name}' and '${game.SecondUser.Name}'`)
        }
        return game
    }

}
import { User } from "./users";

class Game {
    Id: number
    FirstUser: User
    SecondUser: User

    constructor(id: number, firstUser: User, secondUser: User) {
        this.Id = id;
        this.FirstUser = firstUser;
        this.SecondUser = secondUser;
    }
}

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
        return game.Id
    }
}
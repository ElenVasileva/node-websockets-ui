import WebSocket from "ws"

export interface Winner {
    name: string
    wins: number
}

export class User {
    Name: string
    Password: string
    Index: number
    Socket: WebSocket
    Wins: number

    constructor(name: string, password: string, index: number, socket: WebSocket) {
        this.Name = name
        this.Password = password
        this.Index = index
        this.Socket = socket
        this.Wins = 0
    }
}

export default class Users {
    private _userList: User[]

    constructor() {
        this._userList = [
        ]
    }

    public addUser = (name: string, password: string, socket: WebSocket) => {
        const user = new User(name, password, this._userList.length, socket)
        this._userList.push(user)
        console.log(`new user '${name}' added`)
        return user
    }

    public getUserByName(userName: string) {
        return this._userList.find((user) => { return user.Name === userName })
    }

    public getUserBySocket(socket: WebSocket) {
        return this._userList.find((user) => { return user.Socket === socket })
    }

    public getAllSocket() {
        return this._userList.map((user) => { return user.Socket })
    }

    public getWinners() {
        const winners = this._userList.filter((user: User) => { return user.Wins > 0 }).map((user: User) => { return { name: user.Name, wins: user.Wins } as Winner })
        winners.sort((a: Winner, b: Winner) => {
            return b.wins - a.wins
        })
        return winners
    }
}
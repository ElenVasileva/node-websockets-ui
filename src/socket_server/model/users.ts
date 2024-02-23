import WebSocket from "ws"

export class User {
    Name: string
    Password: string
    Index: number
    Socket: WebSocket

    constructor(name: string, password: string, index: number, socket: WebSocket) {
        this.Name = name
        this.Password = password
        this.Index = index
        this.Socket = socket
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
        return user.Index
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
}
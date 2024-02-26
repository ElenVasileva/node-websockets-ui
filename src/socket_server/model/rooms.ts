import { User } from "./users";

class Room {
    Id: number
    User: User

    constructor(id: number, user: User) {
        this.Id = id;
        this.User = user;
    }
}

export default class Rooms {
    private _roomList: Room[]
    private _nextNewRoomId = 0

    constructor() {
        this._roomList = [
        ]
    }

    public addRoom = (user: User) => {
        const room = new Room(this._nextNewRoomId, user)
        this._roomList.push(room)
        this._nextNewRoomId += 2
        console.log(`new room '${room.Id}' added`)
        return room.Id
    }

    public getRooms = () => {
        return this._roomList
    }

    public getRoomById(id: number) {
        return this._roomList.find((room) => { return room.Id === id })
    }

    public removeRoom(room: Room) {
        console.log(`Remove room with id=${room.Id}`)
        const indexInArray = this._roomList.indexOf(room)
        this._roomList.splice(indexInArray, 1)
        console.log(`room count: ${this._roomList.length}`)
    }
}
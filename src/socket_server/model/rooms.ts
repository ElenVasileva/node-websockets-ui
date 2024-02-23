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

    constructor() {
        this._roomList = [
        ]
    }

    public addRoom = (user: User) => {
        const room = new Room(this._roomList.length, user)
        this._roomList.push(room)
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
        const indexInArray = this._roomList.indexOf(room)
        return this._roomList.splice(indexInArray, 1)
    }
}
class Room {
    Id: number
    UserName: string
    UserIndex: number

    constructor(id: number, userName: string, userIndex: number) {
        this.Id = id;
        this.UserName = userName;
        this.UserIndex = userIndex;
    }
}

export default class Rooms {
    private _roomList: Room[]

    constructor() {
        this._roomList = [
        ]
    }

    public addRoom = (userName: string, userIndex: number) => {
        const room = new Room(this._roomList.length, userName, userIndex)
        this._roomList.push(room)
        console.log(`new room '${room.Id}' added`)
        return room.Id
    }

    public getRooms = () => {
        return this._roomList
    }
}
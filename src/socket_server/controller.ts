import { MessageType as MessageType } from "./model/messageType"
import Users from "./model/users"
import Rooms from "./model/rooms"
import WebSocket from "ws"
import ServerResponse from "./model/serverResponse"


const userList = new Users()
const roomList = new Rooms()

const getRoomsResponse = () => {
    const roomsForResponse = roomList.getRooms().map(room => {
        return {
            roomId: room.Id,
            roomUsers:
                [
                    {
                        name: room.UserName,
                        index: room.UserIndex,
                    }
                ],
        }
    })
    return {
        type: MessageType.UPDATE_ROOM,
        data: JSON.stringify(roomsForResponse),
        id: 0,
    }
}

const getUserResponse = (name: string, index: number) => {
    return {
        type: MessageType.REGISTRATION,
        data: JSON.stringify({ name, index, error: false }),
        id: 0
    }
}

const getBadUserResponse = (name: string) => {
    return {
        type: MessageType.REGISTRATION,
        data: JSON.stringify({ name, error: true, errorText: `User with the name '${name}' already registered or password is incorrect` }),
        id: 0
    }
}


const registerUser = (request: string, socket: WebSocket) => {

    const message = JSON.parse(request)
    var user = userList.getUserByName(message.name);
    const responses: ServerResponse[] = []
    if (user && user.Password === message.password) {
        user.Socket.close()
        user.Socket = socket

        responses.push({ ResponseObject: getUserResponse(message.name, user.Index), Recipients: [socket] })
        responses.push({ ResponseObject: getRoomsResponse(), Recipients: [socket] })
    }
    else if (!user) {
        const index = userList.addUser(message.name, message.password, socket)

        responses.push({ ResponseObject: getUserResponse(message.name, index), Recipients: [socket] })
        responses.push({ ResponseObject: getRoomsResponse(), Recipients: [socket] })
    }
    else {
        responses.push({ ResponseObject: getBadUserResponse(message.name), Recipients: [socket] })
    }
    return responses
}


const createRoom = (socket: WebSocket) => {
    const user = userList.getUserBySocket(socket)
    if (user) {
        roomList.addRoom(user.Name, user?.Index)
        return [
            { ResponseObject: getRoomsResponse(), Recipients: userList.getAllSocket() } as ServerResponse
        ]
    }
    return []
}


export { registerUser, createRoom }
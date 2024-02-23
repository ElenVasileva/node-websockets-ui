import { MessageType } from "./model/messageType"
import Users from "./model/users"
import Rooms from "./model/rooms"
import WebSocket from "ws"
import ServerResponse from "./model/serverResponse"
import Games from "./model/games"


const userList = new Users()
const roomList = new Rooms()
const gameList = new Games()

const getRoomsResponse = () => {
    const roomsForResponse = roomList.getRooms().map(room => {
        return {
            roomId: room.Id,
            roomUsers:
                [
                    {
                        name: room.User.Name,
                        index: room.User.Index,
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

const getCreateGameResponse = (gameId: number, userId: number) => {
    return {
        type: MessageType.CREATE_GAME, //send for both players in the room
        data: JSON.stringify({ idGame: gameId, idPlayer: userId }),// id for player in the game session, who have sent add_user_to_room request, not enemy
        id: 0,
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
        roomList.addRoom(user)
        return [
            { ResponseObject: getRoomsResponse(), Recipients: userList.getAllSocket() } as ServerResponse
        ]
    }
    return []
}

const createGame = (request: string, socket: WebSocket) => {

    const responses: ServerResponse[] = []
    const message = JSON.parse(request)

    const room = roomList.getRoomById(message.indexRoom)
    const secondUser = userList.getUserBySocket(socket)
    if (room && secondUser) {
        const gameId = gameList.addGame(message.indexRoom, room.User, secondUser)
        responses.push({ ResponseObject: getCreateGameResponse(gameId, secondUser.Index), Recipients: [room.User.Socket, socket] })
        responses.push({ ResponseObject: getRoomsResponse(), Recipients: userList.getAllSocket() })
        roomList.removeRoom(room)
    }
    return responses
}



export { registerUser, createRoom, createGame }
import { MessageType } from "./model/messageType"
import Users from "./model/users"
import Rooms from "./model/rooms"
import WebSocket from "ws"
import ServerResponse from "./model/serverResponse"
import Games from "./model/games"
import Ship from "./model/ship"
import { AttackStatus } from "./model/attackStatus"


const userList = new Users()
const roomList = new Rooms()
const gameList = new Games()

// const addInitialData = () => {
//     const user1 = userList.addUser('write ', 'write ', new WebSocket(null))
//     const user2 = userList.addUser('Please', 'Please', new WebSocket(null))
//     gameList.addGame(-1, user1, user2)
// }

// addInitialData()

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
        type: MessageType.REGISTRATION_OR_LOGIN,
        data: JSON.stringify({ name, index, error: false }),
        id: 0
    }
}

const getBadUserResponse = (name: string) => {
    return {
        type: MessageType.REGISTRATION_OR_LOGIN,
        data: JSON.stringify({ name, error: true, errorText: `User with the name '${name}' already registered or password is incorrect` }),
        id: 0
    }
}

const getCreateGameResponse = (gameId: number, userIndexInGame: number) => {
    return {
        type: MessageType.CREATE_GAME,
        data: JSON.stringify({ idGame: gameId, idPlayer: userIndexInGame }),// id for player in the game session, who have sent add_user_to_room request, not enemy
        id: 0,
    }
}

const getStartGameResponse = (ships: Ship[]) => {
    return {
        type: MessageType.START_GAME,
        data: JSON.stringify({ ships: ships.map(ship => ship.toUiObject()), currentPlayerIndex: 0 }),
        id: 0,
    }
}

const getTurnResponse = (userIdInGame: number) => {
    return {
        type: MessageType.TURN,
        data: JSON.stringify({ currentPlayer: userIdInGame }),
        id: 0,
    }
}

const getAttackResponse = (x: number, y: number, playerIndexInGame: number, status: AttackStatus) => {
    return {
        type: MessageType.ATTACK,
        data: JSON.stringify({ position: { x: x, y: y, }, currentPlayer: playerIndexInGame, status: status }),
        id: 0,
    }
}

const getFinishResponse = (playerIndexInGame: number) => {
    return {
        type: MessageType.FINISH,
        data: JSON.stringify({ winPlayer: playerIndexInGame }),
        id: 0,
    }
}


const registerUser = (request: string, socket: WebSocket) => {

    const message = JSON.parse(request)
    var user = userList.getUserByName(message.name);
    const responses: ServerResponse[] = []
    if (user && user.Password === message.password) { //   ---   LOGIN   ---
        if (user.Socket.protocol) {
            console.log(user.Socket)
            user.Socket.close()
        }
        user.Socket = socket

        responses.push({ ResponseObject: getUserResponse(message.name, user.Index), Recipients: [socket] })
        const game = gameList.getGameByUser(user)
        if (game) {
            responses.push({ ResponseObject: getCreateGameResponse(game.Id, game.FirstUser === user ? 0 : 1), Recipients: [socket] })
            if (game.FirstUserShips && game.SecondUserShips) {
                responses.push({ ResponseObject: getStartGameResponse(game.FirstUser === user ? game.FirstUserShips : game.SecondUserShips), Recipients: [socket] })
                responses.push({ ResponseObject: getTurnResponse(game.CurrentPlayer), Recipients: [socket] })
            }
        }
        else {
            responses.push({ ResponseObject: getRoomsResponse(), Recipients: [socket] })
        }
    }
    else if (!user) { //   ---   REGISTER   ---
        const user = userList.addUser(message.name, message.password, socket)

        responses.push({ ResponseObject: getUserResponse(message.name, user.Index), Recipients: [socket] })
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

const createGame = (request: string, secondUserSocket: WebSocket) => {

    const responses: ServerResponse[] = []
    const message = JSON.parse(request)

    const room = roomList.getRoomById(message.indexRoom)
    const secondUser = userList.getUserBySocket(secondUserSocket)
    if (room && secondUser) {
        const game = gameList.addGame(message.indexRoom, room.User, secondUser)
        responses.push({ ResponseObject: getCreateGameResponse(game.Id, 1), Recipients: [secondUserSocket] })
        responses.push({ ResponseObject: getCreateGameResponse(game.Id, 0), Recipients: [game.FirstUser.Socket] })
        roomList.removeRoom(room)
        responses.push({ ResponseObject: getRoomsResponse(), Recipients: userList.getAllSocket() })
    }
    return responses
}

const addShips = (request: string, socket: WebSocket) => {
    const responses: ServerResponse[] = []
    const shipsData = JSON.parse(request)
    const user = userList.getUserBySocket(socket)
    const game = gameList.getGameById(shipsData.gameId)
    if (user && game) {
        if (game.addShips(user, shipsData.ships)) {
            responses.push({ ResponseObject: getStartGameResponse(game.FirstUserShips), Recipients: [game.FirstUser.Socket] })
            responses.push({ ResponseObject: getStartGameResponse(game.SecondUserShips), Recipients: [game.SecondUser.Socket] })
            responses.push({ ResponseObject: getTurnResponse(game.CurrentPlayer), Recipients: game.getBothPlayerSockets() })
        }
    }

    return responses
}

const attack = (request: string, socket: WebSocket, random = false) => {
    const responses: ServerResponse[] = []
    const attackData = JSON.parse(request)
    const game = gameList.getGameById(attackData.gameId)
    const user = userList.getUserBySocket(socket)
    if (user && game) {
        console.log('current in game: ' + game.getCurrentPlayerUser().Name)
        console.log('from user: ' + user.Name)
        if (game.getCurrentPlayerUser() === user) {
            const attackStatus = random ? game.randomAttack(attackData, user) : game.attack(attackData.x, attackData.y, user)
            responses.push({ ResponseObject: getAttackResponse(attackData.x, attackData.y, attackData.indexPlayer, attackStatus), Recipients: game.getBothPlayerSockets() })
            if (attackStatus === AttackStatus.KILLED) {
                if (game.Winner) {
                    responses.push({ ResponseObject: getFinishResponse(game.CurrentPlayer), Recipients: game.getBothPlayerSockets() })
                }
                else {
                    game.JustKilledShip?.getCellsAround().forEach(point => {
                        responses.push({ ResponseObject: getAttackResponse(point.x, point.y, game.CurrentPlayer, AttackStatus.MISS), Recipients: game.getBothPlayerSockets() })
                    });
                    responses.push({ ResponseObject: getTurnResponse(game.CurrentPlayer), Recipients: game.getBothPlayerSockets() })
                }
            }
            else {
                responses.push({ ResponseObject: getTurnResponse(game.CurrentPlayer), Recipients: game.getBothPlayerSockets() })
            }
        }
    }
    return responses
}


export { registerUser, createRoom, createGame, addShips, attack }
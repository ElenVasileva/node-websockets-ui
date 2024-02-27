import { WebSocket, WebSocketServer } from 'ws';

import { MessageType } from './model/messageType';
import { registerUser, createRoom, createGame, addShips, attack, createSingleGame } from './controller';
import ServerResponse from './model/serverResponse';


const createResponseByRequest = (request: any, socket: WebSocket) => {
    switch (request.type) {
        case MessageType.REGISTRATION_OR_LOGIN:
            return registerUser(request.data, socket)
        case MessageType.CREATE_ROOM:
            return createRoom(socket)
        case MessageType.ADD_USER_TO_ROOM:
            return createGame(request.data, socket)
        case MessageType.ADD_SHIPS:
            return addShips(request.data, socket)
        case MessageType.ATTACK:
            return attack(request.data, socket)
        case MessageType.RANDOM_ATTACK:
            return attack(request.data, socket, true)
        case MessageType.SINGLE_PLAY:
            return createSingleGame(socket)
        default:
            return []
    }
}

const port = 3000
const webSocketServer = new WebSocketServer({ port: port })
console.log(`Start web socket server on the ${port} port!`);

export const sendResponse = (responses: ServerResponse[]) => {
    responses.forEach(response => {
        const responseString = JSON.stringify(response.ResponseObject)
        response.Recipients.forEach((socket) => {
            if (socket && socket.readyState === socket.OPEN) {
                socket.send(responseString)
            }
        })
        console.log(`response: ${responseString}`);

    });
}

webSocketServer.on('connection', function connection(socket) {
    socket.on('message', function message(data: string) {
        console.log(`received: ${data}`);
        const parsed = JSON.parse(data)
        sendResponse(createResponseByRequest(parsed, socket))

    });
});


export default webSocketServer


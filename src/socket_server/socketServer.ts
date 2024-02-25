import { WebSocket, WebSocketServer } from 'ws';

import { MessageType } from './model/messageType';
import { registerUser, createRoom, createGame, addShips, attack } from './controller';


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
        default:
            return []
    }
}


const webSocketServer = new WebSocketServer({ port: 3000 })


webSocketServer.on('connection', function connection(socket) {
    socket.on('message', function message(data: string) {

        console.log(`received: ${data}`);
        const parsed = JSON.parse(data)
        createResponseByRequest(parsed, socket).forEach(response => {
            const responseString = JSON.stringify(response.ResponseObject)
            response.Recipients.forEach((socket) => {
                if (socket.readyState === socket.OPEN) {
                    socket.send(responseString)
                }
            })
            console.log(`response: ${responseString}`);

        });

    });


});

export default webSocketServer


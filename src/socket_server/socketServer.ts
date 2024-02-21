import { WebSocketServer } from 'ws';

import { RequestType } from './model/requestType';
import { registerUser } from './controller';



const webSocketServer = new WebSocketServer({ port: 3000 })


webSocketServer.on('connection', function connection(ws) {
    ws.on('message', function message(data: string) {
        console.log(`received: ${data}`);
        const parsed = JSON.parse(data)

        switch (parsed.type) {
            case RequestType.REGISTRATION:
                ws.send(JSON.stringify(registerUser(parsed.data)));
        }
    });


});

export default webSocketServer


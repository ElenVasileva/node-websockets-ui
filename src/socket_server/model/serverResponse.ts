import { WebSocket } from "ws"

export default interface ServerResponse {
    ResponseObject: any
    Recipients: (WebSocket | undefined)[]
}
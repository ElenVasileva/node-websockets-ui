import { RequestType } from "./model/requestType"
import Users from "./model/users"


const userList = new Users()

const registerUser = (request: string) => {

    const message = JSON.parse(request)
    const index = userList.addUser(message.name, message.password)
    return {
        type: RequestType.REGISTRATION,
        data: JSON.stringify(
            {
                name: message.name,
                index,
                error: false
            }),
        id: 0
    }
}

export { registerUser }
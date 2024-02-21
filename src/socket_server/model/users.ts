class User {
    Name: string
    Password: string

    constructor(name: string, password: string) {
        this.Name = name;
        this.Password = password;
    }
}

export default class Users {
    private _userList: User[]

    constructor() {
        this._userList = [
        ]
    }

    public addUser = (name: string, password: string) => {
        const user = new User(name, password)
        this._userList.push(user)
        console.log(`new user '${name}' added`)
        return this._userList.length
    }
}
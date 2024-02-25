import { AttackStatus, CellStatus } from "./attackStatus";
import Ship, { UiShip } from "./ship";
import { User } from "./users";

export class Game {
    Id: number
    FirstUser: User
    SecondUser: User

    FirstUserShips: Ship[]
    SecondUserShips: Ship[]

    FirstUserField: (AttackStatus | CellStatus)[][]
    SecondUserField: (AttackStatus | CellStatus)[][]

    CurrentPlayer: 0 | 1

    JustKilledShip: Ship | undefined
    Winner: User | undefined

    constructor(id: number, firstUser: User, secondUser: User) {
        this.Id = id;
        this.FirstUser = firstUser;
        this.SecondUser = secondUser;
        this.CurrentPlayer = 0
    }

    createField = (ships: Ship[]) => {
        let field = new Array<Array<AttackStatus | CellStatus>>
        for (let i = 0; i < 10; i++) {
            let column = new Array<AttackStatus | CellStatus>
            for (let j = 0; j < 10; j++) {
                column.push(CellStatus.WATER)
            }
            field.push(column)
        }
        ships.forEach(ship => {
            for (let i = 0; i < ship.Length; i++) {
                const x = ship.IsVertical ? ship.X : ship.X + i
                const y = ship.IsVertical ? ship.Y + i : ship.Y
                const column = field[x]
                if (column) {
                    column[y] = CellStatus.SHIP
                }
            }
        });
        return field
    }

    areBothUsersAddedShips = () => {
        return this.FirstUserShips && this.SecondUserShips && this.FirstUserShips.length > 0 && this.SecondUserShips.length > 0
    }

    public getBothPlayerSockets = () => {
        return [this.FirstUser.Socket, this.SecondUser.Socket]
    }
    public changePlayer = () => {
        this.CurrentPlayer = 1 - this.CurrentPlayer as 0 | 1
    }

    public getCurrentPlayerUser = () => {
        return this.CurrentPlayer ? this.SecondUser : this.FirstUser
    }

    public addShips = (user: User, uiShips: UiShip[]) => {
        const ships = uiShips.map((uiShip: UiShip) => new Ship(uiShip))
        const field = this.createField(ships)
        if (user === this.FirstUser) {
            this.FirstUserShips = ships
            this.FirstUserField = field
        }
        else {
            this.SecondUserShips = ships
            this.SecondUserField = field
        }
        console.log(`User '${user.Name}' added ${ships.length} ships to the game with id '${this.Id}'`)
        return this.areBothUsersAddedShips()
    }

    public attack = (x: number, y: number, user: User) => {
        let shipsToCheck = user === this.FirstUser ? this.SecondUserShips : this.FirstUserShips
        shipsToCheck = shipsToCheck.filter((ship: Ship) => { return !ship.isKilled() })
        let attackStatus = AttackStatus.MISS

        for (let i = 0; i < shipsToCheck.length; i++) {
            const ship = shipsToCheck[i]
            if (ship) {
                const status = ship.attack(x, y)
                if (status === AttackStatus.KILLED) {
                    if (shipsToCheck.every((ship: Ship) => { return ship.isKilled() })) {
                        this.Winner = user
                    }
                    this.JustKilledShip = ship
                }
                if (status !== AttackStatus.MISS) {
                    attackStatus = status
                    break
                }
            }
        }

        if (attackStatus === AttackStatus.MISS) {
            this.changePlayer()
        }

        console.log(attackStatus)
        return attackStatus
    }

}

export default class Games {
    private _gameList: Game[]

    constructor() {
        this._gameList = [
        ]
    }

    public addGame = (id: number, firstUser: User, secondUser: User) => {
        const game = new Game(id, firstUser, secondUser)
        this._gameList.push(game)
        console.log(`new game '${game.Id}' added`)
        return game
    }

    public getGameById(id: number) {
        return this._gameList.find((game: Game) => { return game.Id === id })
    }

    public getGameByUser(user: User) {
        const game = this._gameList.find((game: Game) => { return !game.Winner && (game.FirstUser === user || game.SecondUser === user) })
        if (game) {
            console.log(`Game with id '${game.Id}' was found, users are '${game.FirstUser.Name}' and '${game.SecondUser.Name}'`)
        }
        return game
    }

}
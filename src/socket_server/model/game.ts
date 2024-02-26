import WebSocket from "ws";
import { AttackStatus, CellStatus } from "./attackStatus";
import { Cell } from "./cell";
import Ship, { UiShip } from "./ship";
import { BOT, User } from "./users";

export class Game {
    Id: number
    FirstUser: User
    SecondUser: User

    FirstUserShips: Ship[]
    SecondUserShips: Ship[]

    FirstUserField: Cell[][]
    SecondUserField: Cell[][]

    CurrentPlayerIndex: 0 | 1

    JustKilledShip: Ship | undefined
    Winner: User | string

    constructor(id: number, firstUser: User, secondUser: User = BOT) {
        this.Id = id;
        this.FirstUser = firstUser;
        this.SecondUser = secondUser;
        this.CurrentPlayerIndex = 0
    }

    createField = (ships: Ship[]) => {
        let field = new Array<Array<Cell>>
        for (let i = 0; i < 10; i++) {
            let column = new Array<Cell>
            for (let j = 0; j < 10; j++) {
                column.push(new Cell(i, j, undefined, CellStatus.WATER))
            }
            field.push(column)
        }
        ships.forEach(ship => {
            for (let i = 0; i < ship.Length; i++) {
                const x = ship.IsVertical ? ship.X : ship.X + i
                const y = ship.IsVertical ? ship.Y + i : ship.Y
                const column = field[x]
                if (column) {
                    const cell = column[y]
                    if (cell) {
                        cell.Ship = ship
                        cell.Status = CellStatus.SHIP
                    }
                }
            }
        });
        return field
    }

    isWithBot = () => {
        return this.SecondUser === BOT
    }

    areAllShipsKilled = (attackingUser: User) => {
        let shipsToCheck = attackingUser === this.FirstUser ? this.SecondUserShips : this.FirstUserShips
        return shipsToCheck.every((ship) => { return ship.isKilled() })
    }

    areBothUsersAddedShips = () => {
        return this.FirstUserShips && this.SecondUserShips && this.FirstUserShips.length > 0 && this.SecondUserShips.length > 0
    }

    setAroundCellAfterKill = (field: Cell[][], killedShip: Ship) => {
        killedShip.getCellsAround().forEach(position => {
            const column = field[position.x]
            if (column) {
                const cell = column[position.y]
                if (cell) {
                    cell.Status = AttackStatus.MISS
                }
            }
        })
    }

    public getBothPlayerSockets = () => {
        const sockets: WebSocket[] = []
        if (this.FirstUser.Socket)
            sockets.push(this.FirstUser.Socket)
        if (this.SecondUser.Socket)
            sockets.push(this.SecondUser.Socket)
        return sockets
    }
    public changePlayer = () => {
        this.CurrentPlayerIndex = 1 - this.CurrentPlayerIndex as 0 | 1
        console.log(`player index will change to ${this.CurrentPlayerIndex}`)
    }

    public getCurrentPlayerUser = () => {
        return this.CurrentPlayerIndex ? this.SecondUser : this.FirstUser
    }

    public addShips = (user: User, ships: Ship[]) => {
        const field = this.createField(ships)
        if (user === this.FirstUser) {
            this.FirstUserShips = ships
            this.FirstUserField = field
        }
        else {
            this.SecondUserShips = ships
            this.SecondUserField = field
        }
        console.log(`User '${user ? user.Name : 'bot'}' added ${ships.length} ships to the game with id '${this.Id}'`)
        return this.areBothUsersAddedShips()
    }

    public addUiShips = (user: User, uiShips: UiShip[]) => {
        const ships = uiShips.map((uiShip: UiShip) => Ship.shipFromUiShip(uiShip))
        return this.addShips(user, ships)
    }

    public attack = (x: number, y: number, attackingUser: User) => {
        let field = attackingUser === this.FirstUser ? this.SecondUserField : this.FirstUserField
        let attackStatus = AttackStatus.MISS
        const column = field[x]
        if (column) {
            const cell = column[y]
            if (cell) {
                if (cell.Status === CellStatus.WATER) {
                    cell.Status = attackStatus = AttackStatus.MISS
                    this.changePlayer()
                }
                else if (cell.Status == CellStatus.SHIP) {
                    const ship = cell.Ship
                    if (ship) {
                        cell.Status = attackStatus = ship.attack(x, y)
                        if (attackStatus === AttackStatus.KILLED) {
                            if (this.areAllShipsKilled(attackingUser)) {
                                this.Winner = attackingUser
                                attackingUser.Wins++
                            }
                            else {
                                this.JustKilledShip = ship
                                this.setAroundCellAfterKill(field, ship)
                            }
                        }
                    }
                }
                else {
                    attackStatus = cell.Status
                }
            }
        }

        console.log(`user ${attackingUser.Name} attacked (${x}, ${y}), status: ${attackStatus}`)
        return { attackStatus, x, y }
    }

    private getRandomPosition = (field: Cell[][]) => {
        const unshotted = []
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                const column = field[i]
                if (column) {
                    const cell = column[j]
                    if (cell) {
                        if (cell.Status === CellStatus.SHIP || cell.Status === CellStatus.WATER) {
                            unshotted.push({ x: i, y: j })
                        }
                    }
                }
            }
        }
        console.log(`unshotted length: ${unshotted.length}`)
        const random = Math.floor(Math.random() * unshotted.length);
        console.log(`random: ${random}`)
        return unshotted[random]
    }

    private checkNeighbour = (field: Cell[][], x: number, y: number) => {
        if (x >= 0 && x < 10 && y >= 0 && y < 10) {
            const column = field[x]
            if (column) {
                const cell = column[y]
                if (cell) {
                    console.log(`checked (${x}, ${y}), status: ${cell.Status}`)
                    if (cell.Status === CellStatus.SHIP || cell.Status === CellStatus.WATER)
                        return true
                }
            }
        }
        return false
    }

    private getRandomPositionNearShip = (field: Cell[][], ship: Ship) => {
        console.log('getRandomPositionNearShip')
        console.log(ship.Shotted[0])
        const shottedOnlyOneDeck = ship.Shotted.length === 1

        console.log(`shottedOnlyOneDeck: ${shottedOnlyOneDeck}`)
        if (shottedOnlyOneDeck) {
            console.log(`ship.Shotted[0]: ${ship.Shotted[0]}`)
            if (ship.Shotted[0] != undefined) {
                const shottedX = ship.IsVertical ? ship.X : ship.X + ship.Shotted[0]
                const shottedY = ship.IsVertical ? ship.Y + ship.Shotted[0] : ship.Y
                console.log(`shotted: (${shottedX}, ${shottedY})`)
                if (this.checkNeighbour(field, shottedX - 1, shottedY)) {
                    return { x: shottedX - 1, y: shottedY }
                }
                if (this.checkNeighbour(field, shottedX + 1, shottedY)) {
                    return { x: shottedX + 1, y: shottedY }
                }
                if (this.checkNeighbour(field, shottedX, shottedY - 1)) {
                    return { x: shottedX, y: shottedY - 1 }
                }
                if (this.checkNeighbour(field, shottedX, shottedY + 1)) {
                    return { x: shottedX, y: shottedY + 1 }
                }
            }
        }
        return this.getRandomPosition(field)
    }

    public randomAttack = (attackingUser: User) => {
        console.log(attackingUser.Name)
        const field = attackingUser === this.FirstUser ? this.SecondUserField : this.FirstUserField
        const ships = attackingUser === this.FirstUser ? this.SecondUserShips : this.FirstUserShips
        const shottedShip = ships.find((ship: Ship) => { return ship.isShotted() })
        console.log(`--------- ${shottedShip?.Length}`)
        const cell = shottedShip ? this.getRandomPositionNearShip(field, shottedShip) : this.getRandomPosition(field)
        if (cell) {
            console.log(`random attack: x=${cell.x}, y=${cell.y}`)
            return this.attack(cell.x, cell.y, attackingUser)
        }
        return { attackStatus: AttackStatus.MISS, x: - 1, y: -1 }

    }

    public createRandomShips = () => {
        const ships: Ship[] = [
            new Ship(3, 4, false, 4),

            new Ship(5, 0, true, 3),
            new Ship(0, 1, false, 3),

            new Ship(4, 6, true, 2),
            new Ship(6, 6, false, 2),
            new Ship(6, 9, false, 2),

            new Ship(0, 3, false, 1),
            new Ship(0, 6, false, 1),
            new Ship(9, 1, false, 1),
            new Ship(9, 3, false, 1)
        ]
        return ships
    }

}
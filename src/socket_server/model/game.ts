import { AttackStatus, CellStatus } from "./attackStatus";
import { Cell } from "./cell";
import Ship, { UiShip } from "./ship";
import { User } from "./users";

export class Game {
    Id: number
    FirstUser: User
    SecondUser: User

    FirstUserShips: Ship[]
    SecondUserShips: Ship[]

    FirstUserField: Cell[][]
    SecondUserField: Cell[][]

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

        console.log(`attackStatus: ${attackStatus}`)
        return attackStatus
    }

    public randomAttack = (attackData: any, user: User) => {
        const field = user === this.FirstUser ? this.SecondUserField : this.FirstUserField
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
        const cell = unshotted[random]
        if (cell) {
            attackData.x = cell.x
            attackData.y = cell.y
        }
        console.log(`random attack: x=${attackData.x}, y=${attackData.y}`)
        return this.attack(attackData.x, attackData.y, user)
    }

}
import { AttackStatus, CellStatus } from "./attackStatus"
import Ship from "./ship"

export class Cell {
    X: number
    Y: number
    Ship: Ship | undefined
    Status: AttackStatus | CellStatus

    constructor(x: number, y: number, ship: Ship | undefined, status: AttackStatus | CellStatus) {
        this.X = x
        this.Y = y
        this.Ship = ship
        this.Status = status
    }
}
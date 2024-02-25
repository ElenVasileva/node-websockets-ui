import { AttackStatus } from "./attackStatus"
import { ShipType } from "./shipType"

export interface UiShip {
    position: { x: number, y: number }
    direction: boolean
    length: number
    type: ShipType
}

export default class Ship {
    X: number
    Y: number
    IsVertical: boolean
    Length: number
    Shotted: number[]

    constructor(ship: UiShip) {
        this.X = ship.position.x
        this.Y = ship.position.y
        this.IsVertical = ship.direction
        this.Length = ship.length
        this.Shotted = []
    }

    getShipType = () => {
        switch (this.Length) {
            case 1:
                return ShipType.SMALL
            case 2:
                return ShipType.MEDIUM
            case 3:
                return ShipType.LARGE
            case 4:
            default:
                return ShipType.HUGE
        }
    }

    public isKilled = () => {
        return this.Shotted.length === this.Length
    }

    public isShotted = () => {
        return this.Shotted.length > 0
    }

    public getCellsAround = () => {
        const cells = [
            { x: this.X - 1, y: this.Y - 1 },
            { x: this.X - 1, y: this.Y },
            { x: this.X, y: this.Y - 1 },
            { x: this.X - 1, y: this.Y + 1 },
            { x: this.X + 1, y: this.Y - 1 },
        ]
        let x = this.X, y = this.Y
        for (let i = 0; i < this.Length - 1; i++) {
            if (this.IsVertical)
                y++
            else
                x++
            cells.push({ x: x + 1, y: y - 1 })
            cells.push({ x: x - 1, y: y + 1 })
        }
        cells.push({ x: x + 1, y })
        cells.push({ x, y: y + 1 })
        cells.push({ x: x + 1, y: y + 1 })
        return cells.filter((cell) => { return cell.x >= 0 && cell.x <= 10 && cell.y >= 0 && cell.y <= 10 })
    }

    public toUiObject = () => {
        return {
            position: { x: this.X, y: this.Y },
            direction: this.IsVertical,
            length: this.Length,
            type: this.getShipType()
        } as UiShip
    }

    public attack = (x: number, y: number) => {
        const delta1 = this.IsVertical ? x - this.X : y - this.Y; // should be 0
        const delta2 = this.IsVertical ? y - this.Y : x - this.X; // sould be from 0 to Length
        if (delta1 === 0 && delta2 >= 0 && delta2 < this.Length) {
            this.Shotted.push(delta2)
            if (this.Shotted.length === this.Length) {
                return AttackStatus.KILLED
            }
            return AttackStatus.SHOT
        }
        return AttackStatus.MISS
    }

}
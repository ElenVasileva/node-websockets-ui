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
    Shotted: number[] = []

    constructor(x: number, y: number, isVertical: boolean, length: number) {
        this.X = x
        this.Y = y
        this.IsVertical = isVertical
        this.Length = length
    }

    static shipFromUiShip = (ship: UiShip) => {
        return new Ship(ship.position.x, ship.position.y, ship.direction, ship.length)
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
        const deckNumber = x - this.X + y - this.Y
        this.Shotted.push(deckNumber)
        console.log(`deckNumber: ${deckNumber}`)
        if (this.Shotted.length === this.Length) {
            return AttackStatus.KILLED
        }
        return AttackStatus.SHOT
    }

}
import {Schema, Types, Document, model as mongooseModel} from "mongoose";
import {User} from "./User";

export namespace Game{
    enum Type{
        Destroyer = "destroyer",
        Cruiser = "cruiser",
        Battleship = "battleship",
        Carrier = "carrier"
    }

    enum Position{
        Vertical = "vertical",
        Horizontal = "horizontal"
    }

    interface Ship{
        type: Type,
        x: number,
        y: number,
        position: Position,
        sunk: boolean
    }


    export interface Game extends Document{
        id: Types.ObjectId,
        player1: User.User | Types.ObjectId,
        player2: User.User | Types.ObjectId,
        winner: User.User | Types.ObjectId,
        ships1: Ship[],
        ships2: Ship[],
        started: Date,
        ended: Date,
        ranked: boolean
        // TODO: lista di mosse
    }

    const ShipSchema = new Schema<Ship>({
        type:{
            type: Schema.Types.String,
            required: true
        },
        x:{
            type: Schema.Types.Number,
            required: true,
            range: 0-9
        },
        y:{
            type: Schema.Types.Number,
            required: true,
            min: 0,
            max: 9
        },
        position:{
            type: Schema.Types.String,
            required: true
        },
        sunk:{
            type: Schema.Types.Boolean,
            required: true
        }
    })

    const schema = new Schema<Game>({
        // TODO: aggiungere lista di mosse
        player1:{
            type: Types.ObjectId,
            required: true,
            ref: "User"
        },
        player2:{
            type: Types.ObjectId,
            required: true,
            ref: "User"
        },
        winner: {
            type: Types.ObjectId,
            required: true,
        },
        ships1:{
            type: [ShipSchema],
            required: true
        },
        ships2:{
            type: [ShipSchema],
            required: true,
        },
        started: {
            type: Date,
            required: true
        },
        ended: {
            type: Date,
            required: true
        },
        ranked:{
            type: Schema.Types.Boolean,
            required: true
        }
    })
    export const model = mongooseModel<Game>('Game', schema);
}

import {Schema, Types, Document, model as mongooseModel} from "mongoose";
import {User} from "./User";
import {Game} from "./Game";


export namespace Message{
    export enum Type {
        Game = 'Game',
        User = 'User'
    }

    export interface Message extends Document {
        readonly id: Types.ObjectId,        // message id
        receiver: User.User | Game.Game | Types.ObjectId,
        sender: User.User | Types.ObjectId,
        onModel: Type,
        content: string,
        datetime: Date
    }

    const schema = new Schema<Message>({
        sender: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        receiver: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        onModel: {
            type: Schema.Types.String,
            required: true,
            enum: ['User', 'Game']
        },
        content: {
            type: Schema.Types.String,
            required: true
        },
        datetime: {
            type: Schema.Types.Date,
            required: true
        }
    });

    export const model = mongooseModel<Message>('Message', schema);
}

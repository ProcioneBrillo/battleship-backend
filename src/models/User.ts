import {Schema, Types, Document, model as mongooseModel} from "mongoose";
import crypto from "crypto";

export namespace User{

    export enum Role {
        User= "user",
        Moderator= "moderator",
        Admin= "admin",
    }

    export interface User extends Document{
        name: string | undefined;
        surname: string | undefined;
        username: string;
        password: string;
        salt: string;
        readonly id: Types.ObjectId;
        friends: User[];
        avatar: string | undefined;
        role: Role;
        creation_date: Date;
        last_password_change: Date;
        banned: boolean;

        set_password: (pwd: string) => void,
        validate_password: (pwd: string) => boolean,
        has_role: (role: Role) => boolean,
        set_role: (role: Role) => void,
    }

    const schema = new Schema<User>({
        name: {
            type: Schema.Types.String,
            required: false,
            match: [new RegExp('^[a-zA-Z àèìòù]+$'), "Name must not contains special characters"]
        },
        surname: {
            type: Schema.Types.String,
            required: false,
            match: [new RegExp('^[a-zA-Z àèìòù]+$'), "Surname must not contains special characters"]
        },
        password:{
            type: Schema.Types.String,
            required: true
        },
        username: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            match: [new RegExp('^[a-zA-Z0-9\-_]+$'), "Username contains invalid character, must contains only a-z, A-Z, 0-9, - _"],
            minlength: [3, "Username too short, must be at least 3 characters long"],
            maxlength: [20, "Username too long, must be less than 20 characters long"]
        },
        salt: {
            type: Schema.Types.String,
            required: true
        },
        friends: [{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }],
        avatar:{
            type: Schema.Types.String,
            required: false,
        },
        role:{
            type: Schema.Types.String,
            required: true
        },
        creation_date:{
            type: Schema.Types.Date,
            required: true
        },
        last_password_change:{
            type: Schema.Types.Date,
            required: true
        },
        banned:{
            type: Schema.Types.Boolean,
            required: true,
            default: false
        }
    });

    schema.methods.set_password = function(pwd:string) {
        this.salt = crypto.randomBytes(16).toString('hex'); //random 16-bytes hex string for salt
        const hmac = crypto.createHmac('sha512', this.salt );
        hmac.update( pwd );
        this.password = hmac.digest('hex'); // The final digest depends both by the password and the salt
    }

    schema.methods.validate_password = function(pwd:string):boolean {
        const hmac = crypto.createHmac('sha512', this.salt );
        hmac.update(pwd);
        const digest = hmac.digest('hex');
        return (this.password === digest);
    }

    schema.methods.has_role = function (role: Role): boolean{
        return this.role === role;
    }

    schema.methods.set_role = function (role: Role): void {
        this.role = role;
    }

    export const model = mongooseModel<User>('User', schema);

    export function new_user(username: string, name?: string, surname?: string){
        return new model({username, name, surname, creation_date: new Date(), last_password_change: new Date(), role: Role.User});
    }
}
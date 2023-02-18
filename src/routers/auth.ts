import 'dotenv/config';
import passport from "passport";
import {BasicStrategy} from "passport-http";
import {User} from "../models/User";
import {Router} from "express";
import {sign} from "jsonwebtoken";
import {expressjwt} from "express-jwt";
import {joiPasswordExtendCore} from "joi-password";
import {celebrate, Segments, Joi} from "celebrate";

export interface TokenData {
    id: string;
    username: string,
    role: User.Role,
    banned: User.User["banned"],
    last_pw_change: User.User["last_password_change"]
    creation_date: User.User["creation_date"]
}

const joiPassword = Joi.extend(joiPasswordExtendCore);

declare global {
    namespace Express {
        interface User extends TokenData {
        }
    }
}

if (process.env.SECRET_KEY === undefined) {
    console.error("secret key must be defined as environmental variable");
    process.exit(-1);
}
const secret: string = process.env.SECRET_KEY;
export const auth = expressjwt({algorithms:["HS256"], secret: secret, requestProperty: "user"});

passport.use(
    new BasicStrategy(async (username, password, done) => {
        const user = await User.model.findOne({username: username});
        if (!user) {
            console.error("1 invalid credentials");
            return done({status: 403, error: true});
        }
        if (!user.validate_password(password)) {
            console.error("2 invalid credentials");
            return done({status: 403, error: true});
        }
        if (user.banned){
            console.error("banned user tried to login: " + user.username);
            return done({status: 403, error: true});
        }
        // all ok
        return done(null, user);
    })
)

export const auth_router = Router();
//                                                   defined above , no cookie session
auth_router.get("/login", passport.authenticate('basic', {session: false}), (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({error: true, message: "3 invalid credentials"});
    }
    // filling token body
    const payload: TokenData = {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        banned: req.user.banned,
        last_pw_change: req.user.last_pw_change,
        creation_date: req.user.creation_date
    }
    // token sign
    const token = sign(payload, secret, {expiresIn: "1h"});
    return res.status(200).json({token: token});
});

// create a new user
auth_router.post("/register",
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            username: Joi.string().required().min(5).max(20).alphanum(),
            password: joiPassword.string().required().minOfSpecialCharacters(1).minOfLowercase(1)
                .minOfUppercase(1).minOfNumeric(1).noWhiteSpaces()
        })
    }),
    async (req, res, next) => {
        // TODO: non dovrebbe servire perché di default un utente ha un ruolo
        // hasn't role
        // if(req.user.role === undefined)
        //     return res.status(403).json({error: true, message:"Invalid role"})

        // has role
        let u: User.User = User.new_user(req.body.username);
        u.set_password(req.body.password);
        try{
            const data = await u.save();
            return res.status(200).json({error: false, message: "", id: data._id});
        }
        catch(e: any){
            if (e.code === 11000) {
                return next({statusCode: 500, error: true, message: "User already exists"});
            }
            return next({status: 500, error: true, message: e.message});
        }
    });

import 'dotenv/config';
import passport from "passport";
import {BasicStrategy} from "passport-http";
import {User} from "../models/User";
import {Router} from "express";
import {sign} from "jsonwebtoken";

export interface TokenData{
    id : string;
    username: string,
    role: User.Role,
}

declare global{
    namespace Express{
        interface User extends TokenData{}
    }
}

if(process.env.SECRET_KEY === undefined){
    console.error("secret key must be defined as environmental variable");
    process.exit(-1);
}
const secret: string = process.env.SECRET_KEY;

passport.use(
    new BasicStrategy(async (username, password, done) => {
        const user = await User.model.findOne({username: username});
        if(!user){
            console.error("1 invalid credentials");
            return done({status: 403, error: true});
        }
        if(!user.validate_password(password)){
            console.error("2 invalid credentials");
            return done({status: 403, error: true});
        }
        if(user.banned){
            console.error("banned user tried to login: " + user.username);
            return done({status: 403, error: true});
        }
        // tutto nella norma
        return done(null,user);
    })
)

export const auth_router = Router();
//                                                   defined above , no cookie session
auth_router.get("/login", passport.authenticate('basic', {session: false}), (req, res, next) =>{
    if(!req.user){
        return res.status(403).json({error: true, message: "3 invalid credentials"});
    }
    // filling token body
    const payload: TokenData = {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
    }
    // firma token
    const token = sign(payload, secret, {expiresIn: "15m"});
    return res.status(200).json({token: token});
});


// // TODO
// auth_router.post("/login", ) ;
//
// //TODO
// auth_router.delete("/login");
//
// //TODO
// auth_router.put("/login");

import {Router} from "express";
import {celebrate, Joi, Segments} from "celebrate";
import {joiPasswordExtendCore} from "joi-password";
import {User} from "../models/User";
import {auth} from "./auth";

const joiPassword = Joi.extend(joiPasswordExtendCore);


export const moderator_register = Router();


moderator_register.post("/moderator/register", auth, celebrate({
        [Segments.BODY]:
            Joi.object().keys({
                username: Joi.string().required().min(4).max(30).alphanum(),
                password: joiPassword.string().required().minOfSpecialCharacters(1).minOfLowercase(1)
                    .minOfUppercase(1).minOfNumeric(1).noWhiteSpaces(),
                role: Joi.string().default("Moderator")
            })
        }), async (req, res, next) => {
    if(User.Role[req.body.role] === undefined){
        return res.status(403).json({error: true, message:"Invalid role"})
    }
    if(req.body.role === User.Role.Moderator){
        if((req.user?.role) !== User.Role.Admin){
            return res.status(403).json({error: true, message:"Insufficient permission"});
        }
    }
    let u: User.User = User.new_user(req.body.username);
    u.set_password(req.body.password);
    u.set_role(req.body.role);

    await u.save();

    return res.status(200).json({error: false, message:""});
});
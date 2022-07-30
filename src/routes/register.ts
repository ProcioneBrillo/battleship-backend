import {Router} from "express";
import {body, validationResult} from "express-validator";
import {User} from "../models/User";


export const register_route = Router();

// create a new user
register_route.post("/register",
    body("username",
        "Missing or invalid username. Username must be between 3 and 20 characters long").exists().isLength({
        min: 3,
        max: 20
    }),
    body("password",
        "Invalid/missing password. Password must contains at least 8 characters, 1 lowercase, 1 uppercase, and 1 number").exists().isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1
    }), async (req, res, next) => {
        const result = validationResult(req); //Extracts the validation errors from a request and makes them available in result
        if (!result.isEmpty()) { // if contains error
            const mex = [];
            for (let val of result.array()) {
                mex.push(val.msg);
            }
            console.error(result.array());
            return res.status(403).json({error: true, message: mex});
        }
        const _user = User.new_user(req.body.username);
        _user.set_password(req.body.password);
        try {
            const my_user = await _user.save();
            return res.status(200).json({error: false, message: "", id: my_user.id});
        } catch (e: any) {
            if (e.code === 11000)
                return next({
                    statusCode: 500, error: true,
                    message: "User already exist"
                });
            return next({statusCode: 500, error: true, message: e.message})
        }
    });



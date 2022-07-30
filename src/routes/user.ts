import {Router} from "express";


export const user_router = Router();

// ritorna la lista amici
user_router.get("/users");

// ritorna l'utente con id
user_router.get("/users/:id", (req, res, next) => {
    if(!req.user){
        return next({status: 500, error: true, message: "oops, something went wrong"});
    }
    return res.status(200).json(req.user);
});

// elimina il mio utente
//TODO eliminare la lista amici e eliminarsi dalla lista amici degli amici
user_router.delete("/users/:id");

// aggiorna l'utente id
user_router.put("/users/:id");

// aggiorna tutti gli utenti
user_router.put("/users");

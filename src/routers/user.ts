import {Router} from "express";
import {auth} from "./auth";
import {User} from "../models/User";

export const user_router = Router();

// ritorna l'utente tramite id
user_router.get("/:id", auth, async (req, res, next) => {
    // Questo non dovrebbe capitare perché ci pensa auth a impostare req.user dopo aver letto il token
    // ma TypeScript non è capace a identificare il tipo perché cambia in base a se "auth" è presente o meno
    if (!req.user) {
        return next({status: 500, error: true, message: "oops, something went wrong"});
    }
    // Se l'utente non è admin/mod/proprietario allora si risponde con 403 Unauthorized
    if (!(req.user.role === User.Role.Admin || req.user.role === User.Role.Moderator || req.user.id === req.params.id)) {
        return res.status(403).json({error: true, message: "You are not authorized"});
    }
    try {
        console.log("- richiesto user con id: " + req.params.id);
        // Recupera l'utente dal DB, projection evita di recuperare password e salt
        const user = await User.model.findOne({_id: req.params.id}, {password: 0, salt: 0});
        // Se non ha trovato l'utente, avvisa con 404 Not Found
        if (!user) {
            return res.status(404).json({error: true, message: "User not found"});
        }
        // Se trova l'utente, successo, ritorna l'utente
        return res.status(200).json(user);
    } catch (e) {
        // FindOne potrebbe tirare un eccezione, per esempio se il DB va offline e non può fare la query
        console.error(e);
        return res.status(500).json({error: true, message: "Server error"});
    }
});

// elimina il mio utente
user_router.delete("/:id", auth, async (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({error: true, message: "Oops, something went wrong"});
    }
    // se l'utente non è admin o l'id nella richiesta non corrisponde all'id nell'url
    if (req.user.role !== User.Role.Admin && req.user.id !== req.params.id) {
        return res.status(403).json({error: true, message: "Unauthorized"});
    }
    // se è admin oppure moderator oppure l'id corrisponde a quello sull'url
    if (req.user.role === User.Role.Admin || req.user.role === User.Role.Moderator || req.user.id === req.params.id) {
        //eliminare l'utente
        console.log("- deleting user: " + req.user.username);
        try {
            const user = await User.model.findOne({_id: req.params.id}, {password: 0, salt: 0});  // cerco utente
            if (!user) {  // se non c'è
                return res.status(404).json({error: true, message: "User not found"});  // notifico con 404
            }
            user.delete();  // elimino utente (spero)
            //TODO: eliminare la lista amici
            return res.status(200).json({error: false, message: ""}); // ok
        } catch (e) {
            console.error(e);
            return res.status(500).json({error: true, message: "Server error"});
        }
    }
});

// aggiorna l'utente id
user_router.put("/:id", auth, (req, res, next) => {
    if (!req.user || !req.user.id) {
        return next({status: 500, error: true, message: "Oops, something went wrong"});
    }
    if (req.params.id !== req.user.id && req.user.role !== User.Role.Admin && req.user.role !== User.Role.Moderator) {
        return res.status(403).json({error: true, message: "Unauthorized"});
    }
    //TODO aggiornare
});

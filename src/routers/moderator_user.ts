import {Router} from "express";


export const moderator_user_router = Router();

// lista di tutti gli utenti
moderator_user_router.get("/users");

// moderatore elimina tutti gli utenti
moderator_user_router.delete("/users");

// moderatore elimina l'utente con id
moderator_user_router.delete("/users/:id");

// moderatore aggiorna un moderatore ??
moderator_user_router.put("/moderators/:moderator_id");

// moderatore crea un nuovo moderatore
moderator_user_router.post("moderators/moderator");
import mongoose from "mongoose";
import {User} from "./models/User";
import crypto from "crypto";
import http from "http";
import express from "express";
import cors from "express";

const PORT = 8080;
const HOSTNAME = "localhost";

const app = express();
app.use(cors());

app.get("/", (req, res, next) => {
    return res.status(200).json("Hello world");
});
//TODO creati le route dentro src/routes: https://expressjs.com/en/guide/routing.html
//  leggi TUTTO ma in particolare express.Router in poi
//  Vedi anche questo: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
// In linea generale:
//  GET /risorsa -> restituisce tutte le risorse
//  GET /risorsa/:id -> resituisce la risorsa con quell'ID
//  POST /risorsa  -> crea una risorsa, restituisce o l'ID o la risorsa intera (così hai l'ID con cui lavorarci)
//  PUT /risorsa/:id -> modifica la risorsa con l'ID specificato
//  DELETE /risorsa/id -> cancella la risorsa con l'ID specificato, ritorna 200 in caso di successo
// .
// Ricorda che ogni PATH deve cominciare con /api/v{numero}/{risorsa}/{:id}
// Dove:
// numero -> versione dell'api
// risorsa -> è la risorsa specificata, quindi tipo users/messages/games
// id -> è l'id della risorsa
// .
// Puoi anche accedere a sotto risorse, tipo
// GET /api/v1/users/1/friends
// deve ritornarti la lista di amici dell'utente con ID uno (N.B: Mongo non usa numeri come ID ma stringhe oscene)

mongoose.connect("mongodb://127.0.0.1:27017/battleship-db").then(async () => {
    const admin = await User.model.findOne({username:"admin"});
    if(!admin){
        const user = User.new_user("admin");
        user.role = User.Role.Admin;
        const a = crypto.randomBytes(20).toString("hex");
        console.log("admin password: " ,a);
        user.set_password(a);
        await user.save();
    }
    const server = http.createServer(app);
    server.listen(PORT, HOSTNAME);
});



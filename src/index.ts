import mongoose from "mongoose";
import {User} from "./models/User";
import crypto from "crypto";
import http from "http";
import express, {Router} from "express";
import cors from "cors";
import {auth_router} from "./routes/auth";
import {user_router} from "./routes/user";

const PORT = 8081;
const HOSTNAME = "localhost";


const user: string | undefined = process.env.MONGO_USER;
const password: string | undefined = process.env.MONGO_PASSWORD;

const app = express();

// TODO: leggi questo https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(cors({
    origin: "*"
}));

const v1 = Router();

v1.use(auth_router);
v1.use("/users", user_router);

app.use("/api/v1", v1);

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

let auth = {};

console.log(user);
console.log(password);

if(user && password){
    auth = { user: user, pass: password, authSource: "test"};
}

mongoose.connect("mongodb://127.0.0.1:27017/battleship", auth).then(async () => {
    const admin = await User.model.findOne({username:"admin"});
    if(!admin){
        const user = User.new_user("admin");
        user.role = User.Role.Admin;
        const a = crypto.randomBytes(20).toString("hex");
        console.log("admin password: ",a);
        user.set_password(a);
        await user.save();
    }
    const server = http.createServer(app);
    server.listen(PORT, HOSTNAME);
    console.log("Server avviato");
});
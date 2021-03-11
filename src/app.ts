import 'reflect-metadata' 
import "./database"
import express from 'express';
import createConnection from './database';
import { router } from './routes';

createConnection();
const app = express();

app.use(express.json());
app.use(router);

app.get("/users", (request, response) => {
    return response.send("Hello world");
});

export { app }; 
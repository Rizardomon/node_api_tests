import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';

import { MqttHandler } from './services/MqttServices';

import { Server } from 'socket.io';

import { router } from './routes';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

var mqttClient = new MqttHandler();
mqttClient.connect();

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
});

app.use(express.json()); // Informando que ele vai usar json

app.use(router); // Define as rotas da aplicação

/**
 * Parameters types
 * Route Params => http://localhost:3333/users/1121212
 * *Use the ? to indicate a query and & to add another query
 * Query Params => http://localhost:3333/users?name=Richard&lastName=Campos
 * 
 * Body Params => {
 *  "name": "Richard",
 *  "lastName": "Campos"
 * }
 */

// Rota que direciona para gerar um token oath do github
app.get('/github', (request, response) => {
  response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`);
});

// Rota callback após a autenticação que pega o codigo da url e retorna um json com ele
app.get('/signin/callback', (request, response) => {
  const { code } = request.query;

  return response.json(code);
});

app.post("/mqtt", function (req, res) {
  try {
    mqttClient.sendMessage(req.body.topic, req.body.message);
    res.status(200).json({
      "status": "success",
      "topic": req.body.topic,
      "message": req.body.message,
    });
  } catch (error) {
    res.status(500).json({
      "status": "error",
      "message": error,
    })
  }
});

export { serverHttp, io }
import 'reflect-metadata';
import { WebSocketServer } from 'ws';
import { Chat } from './chat';

const porta = 8080;
const webSocketServer = new WebSocketServer({
  port: porta,
});
console.log(`Executando aplicação na porta ${porta}`);

const chat = new Chat();
webSocketServer.on('connection', (webSocket) => {
  chat.adicionarConexao(webSocket);
});

import express from 'express'
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv'
import getDBConnection from './database.js';
import chatrooms from './routes/chatrooms.js';
import messages from './routes/messages.js';
import reactions from './routes/reactions.js';
import user from './routes/user.js'
import token from './routes/token.js'
import {createServer} from 'http'
import {Server} from 'socket.io'


dotenv.config()

const conn = await getDBConnection()

//Creating the Express App
const app = express();

const httpServer = new createServer(app)
const io = new Server(httpServer)

app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(morgan('combined'));
app.use( (req,res,next) => {req.conn = conn; next()})


app.use('/chatrooms', chatrooms)
app.use('/messages', messages)
app.use('/reactions', reactions)
app.use('/user', user)
app.use('/token', token)

//Whenever someone connects this gets executed
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.emit("hello", "world");

  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
});

// starting the server
httpServer.listen(3001, () => {
  console.log('listening on port 3001');
});
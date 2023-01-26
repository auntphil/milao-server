import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv'
import getDBConnection from './database.js';
import messages from './routes/messages.js';

dotenv.config()

const conn = await getDBConnection()

//Creating the Express App
const app = express();

// defining an array to work as the database (temporary solution)
const ads = [
  {title: 'Hello, world (again)!'}
];

app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors());
app.use(morgan('combined'));


app.use('/messages', (req, res, next)=>{req.conn = conn; next();}, messages)


// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
});
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import ioserver from 'socket.io';

import sockets from './socketIO';

dotenv.config();

export const connectToMongo = async () => {
  try {
    console.log(`connecting to mongo`);
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@violet.zoqgo.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true },
    );
    console.log(`Connected to MongoDB`);
  } catch (err) {
    console.error(`Error connecting to MongoDB`, err);
  }
};

(async () => connectToMongo())();

const app = express();

const server = require('http').Server(app);

const io = ioserver(server);

io.listen(server)

io.use(sockets(io));

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

server.listen(process.env.PORT, () => {
  console.log(`Server is up at port ${process.env.PORT}`);
});

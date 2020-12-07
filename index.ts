import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import connectToMongo from './mongo';

import PlayerSchema from './graphql'
import PlayerResolver from './graphql/PlayerResolver'

dotenv.config();

await connectToMongo();

const app = express();

const PlayerScheme = PlayerSchema()

const schema = await buildSchema({ resolvers: [PlayerResolver] });

const server = new ApolloServer({
  schema,
});

server.applyMiddleware({ app, path: '/graphql' });

app.use(cors());

app.use(express.static('public'));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen({ port: process.env.PORT }, () => {
  console.log(
    `Server listening on ${process.env.PORT}\nApollo Server listening on ${process.env.PORT}/graphql`,
  );
});

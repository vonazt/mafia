import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Container } from 'typedi';
import path from 'path';
import connectToMongo from './mongo';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import GameResolvers from './graphql/GameResolvers';
import GameHandlerFactory from './Factories/GameHandlerFactory';

const init = async () => {
  dotenv.config();

  await connectToMongo();

  const app = express();

  Container.set({ id: "GAME_SERVICE", factory: () => GameHandlerFactory.build() });
  
  const schema = await buildSchema({
    resolvers: [GameResolvers],
    container: Container,
  });

  const server = new ApolloServer({
    schema,
  });

  server.applyMiddleware({ app, path: '/graphql' });

  app.use(cors());

  app.use(express.static('public'));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is up at port ${process.env.PORT}`);
  });
};

init();

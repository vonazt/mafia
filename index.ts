import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Container } from 'typedi';
import path from 'path';
import http from 'http';
import connectToMongo from './mongo';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { gameResolvers, playerResolvers } from './graphql/';
import GameHandlerFactory from './Factories/GameHandlerFactory';
import PlayerHandlerFactory from './Factories/PlayerHandlerFactory';

const init = async () => {
  dotenv.config();

  await connectToMongo();

  const app = express();

  Container.set({
    id: 'GAME_SERVICE',
    factory: () => GameHandlerFactory.build(),
  });

  Container.set({
    id: 'PLAYER_SERVICE', factory: () => PlayerHandlerFactory.build()
  })

  const schema = await buildSchema({
    resolvers: [gameResolvers, playerResolvers],
    container: Container,
  });

  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: `/subscriptions`,
    },
  });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  server.applyMiddleware({ app, path: '/graphql' });

  app.use(cors());

  app.use(express.static('public'));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });

  httpServer.listen(process.env.PORT, () => {
    console.log(`Server is up at port ${process.env.PORT}`);
  });
};

init();

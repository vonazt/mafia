import { gql } from '@apollo/client';

export const CREATE_GAME = gql`
  mutation {
    create {
      gameId
      stages {
        intro
      }
    }
  }
`;

export const GAME_SUBSCRIPTION = gql`
  subscription OnGameUpdated($gameId: String!) {
    updatedGame(gameId: $gameId) {
      gameId
      players {
        name
      }
    }
  }
`;

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

export const JOIN_GAME = gql`
  mutation join($gameId: String!) {
    join(gameId: $gameId) {
      gameId
      stages {
        intro
      }
      players {
        name
      }
    }
  }
`;

export const ADD_PLAYER = gql`
  mutation addPlayer($gameId: String!, $player: PlayerInput!) {
    addPlayer(gameId: $gameId, player: $player) {
      gameId
      players {
        name
        _id
      }
    }
  }
`

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



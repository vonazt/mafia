import { gql } from '@apollo/client';

export const CREATE_GAME = gql`
  mutation {
    createGame {
      gameId
      stage
      players {
        name
      }
    }
  }
`;

export const JOIN_GAME = gql`
  mutation joinGame($gameId: String!) {
    joinGame(gameId: $gameId) {
      gameId
      stage
      players {
        name
        isAlive
        _id
      }
    }
  }
`;

export const START_GAME = gql`
  mutation startGame($gameId: String!) {
    startGame(gameId: $gameId) {
      gameId
      stage
    }
  }
`

export const ADD_PLAYER = gql`
  mutation addPlayer($gameId: String!, $player: PlayerInput!) {
    addPlayer(gameId: $gameId, player: $player) {
      gameId
      players {
        name
        _id
        isAlive
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
        isAlive
        _id
      }
      stage
    }
  }
`;

export const PLAYER_SUBSCRIPTION = gql`
  subscription OnPlayerUpdated($_id: String!) {
    updatedPlayer(_id: $_id) {
      name
      _id
      role
      isAlive
    }
  }
`



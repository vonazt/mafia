import { gql } from '@apollo/client';

export const CREATE_GAME = gql`
  mutation {
    createGame {
      gameId
      stage
      players {
        name
      }
      nominatedPlayers {
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
        nominatedBy {
          name
          _id
        }
      }
      nominatedPlayers {
        name
      }
      lastPlayerKilled {
        name
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
`;

export const ADD_PLAYER = gql`
  mutation addPlayer($gameId: String!, $player: PlayerInput!) {
    addPlayer(gameId: $gameId, player: $player) {
      gameId
      players {
        name
        _id
        isAlive
      }
      lastPlayerKilled {
        name
        _id
      }
    }
  }
`;

export const REJOIN_PLAYER = gql`
  mutation rejoinPlayer($gameId: String!, $player: PlayerInput!) {
    rejoinPlayer(gameId: $gameId, player: $player) {
      gameId
      players {
        name
        _id
        isAlive
        nominatedBy {
          name
          _id
        }
      }
    }
  }
`;

export const NOMINATE_PLAYER_FOR_ASSASSINATION = gql`
  mutation nominatePlayerForAssassination(
    $playerId: String!
    $mafiaHitmanId: String!
    $gameId: String!
  ) {
    nominatePlayerForAssassination(
      playerId: $playerId
      mafiaHitmanId: $mafiaHitmanId
      gameId: $gameId
    ) {
      stage
      players {
        nominatedBy {
          name
          _id
        }
      }
      nominatedPlayers {
        name
        _id
      }
    }
  }
`;

export const CONFIRM_ASSASSINATION = gql`
  mutation confirmAssassination($playerKilledId: String!, $gameId: String!) {
    confirmAssassination(playerKilledId: $playerKilledId, gameId: $gameId) {
      stage
    }
  }
`;

export const INVESTIGATE_PLAYER = gql`
  query investigatePlayer($_id: String!) {
    investigatePlayer(_id: $_id)
  }
`;

export const END_DETECTIVE_TURN = gql`
  mutation endDetectiveTurn($gameId: String!) {
    endDetectiveTurn(gameId: $gameId) {
      stage
      lastPlayerKilled {
        _id
        name
      }
    }
  }
`;

export const PROTECT_PLAYER = gql`
  mutation protectPlayer($_id: String!, $gameId: String!) {
    protectPlayer(_id: $_id, gameId: $gameId)
  }
`;

export const END_GUARDIAN_ANGEL_TURN = gql`
  mutation endGuardianAngelTurn($gameId: String!) {
    endGuardianAngelTurn(gameId: $gameId) {
      stage
      gameId
      lastPlayerKilled {
        _id
        name
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
        isAlive
        _id
        nominatedBy {
          name
          _id
          role
        }
      }
      stage
      nominatedPlayers {
        name
        _id
      }
      lastPlayerKilled {
        name
        _id
      }
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
`;

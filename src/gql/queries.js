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

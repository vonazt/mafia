import { LeanPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';
import { LeanGameDocument } from '../DomainObjects/Mongoose/GameDocuments';
import {
  NominatedAndAliveAndMafiaPlayers,
  Player,
} from '../DomainObjects/Player';
import { IPlayerRepository } from '../Repositories/PlayerRepository';
import { IGameRepository } from '../Repositories/GameRepository';
import {
  DETECTIVE_AWAKE,
  MAFIA,
  PLAYER_LYNCHED,
  ROLE,
  TIE,
  TWO_NOMINATIONS,
} from '../constants';

export interface IPlayerService {
  add: (gameId: string, player: Player) => Promise<LeanGameDocument>;
  nominateForAssassination: (
    playerId: string,
    mafiaHitmanId: string,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  confirmAssassination: (
    playerKilledId: string,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  investigate: (_id: string) => Promise<boolean>;
  protect: (_id: string, gameId: string) => Promise<boolean>;
  nominate: (
    playerToNominateId: string,
    nominatedById: string,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  lynch: (
    playerToLynchId: string,
    nominatedById: string,
    gameId: string,
  ) => Promise<LeanGameDocument>;
}
export default class PlayerService implements IPlayerService {
  constructor(
    private playerRepository: IPlayerRepository,
    private gameRepository: IGameRepository,
  ) {}
  public add = async (
    gameId: string,
    player: Player,
  ): Promise<LeanGameDocument> => {
    const { players }: LeanGameDocument = await this.gameRepository.getById(
      gameId,
    );
    const playerAlreadyInGame: Player = players.find(
      ({ name, _id }: Player) =>
        name === player.name && _id.toString() === player._id.toString(),
    );

    if (!playerAlreadyInGame) {
      const newPlayer = await this.playerRepository.create({
        name: player.name,
      });
      return this.gameRepository.update(gameId, {
        $addToSet: {
          players: newPlayer._id,
        },
      });
    }

    return this.gameRepository.getById(gameId);
  };

  public nominateForAssassination = async (
    playerId: string,
    mafiaHitmanId: string,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(playerId, mafiaHitmanId);
    const updatedGame: LeanGameDocument = await this.gameRepository.getById(
      gameId,
    );

    const {
      nominatedPlayers,
      mafiaPlayers,
    }: NominatedAndAliveAndMafiaPlayers = this.getNominatedAndAliveAndMafiaPlayers(
      updatedGame.players,
    );

    if (
      nominatedPlayers.length === 1 &&
      nominatedPlayers[0].nominatedBy.length === mafiaPlayers.length
    ) {
      return this.gameRepository.update(gameId, {
        nominatedPlayers,
      });
    }
    return this.gameRepository.update(gameId, {
      nominatedPlayers: [],
    });
  };

  public confirmAssassination = async (
    playerKilledId: string,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    const lastPlayerKilled: LeanPlayerDocument = await this.playerRepository.updateById(
      playerKilledId,
      {
        nominatedBy: [],
      },
    );

    return this.gameRepository.update(gameId, {
      lastPlayerKilled,
      nominatedPlayers: [],
      stage: DETECTIVE_AWAKE,
    });
  };

  public investigate = async (_id: string): Promise<boolean> => {
    const { role }: LeanPlayerDocument = await this.playerRepository.getById(
      _id,
      ROLE,
    );
    return role === MAFIA;
  };

  public protect = async (_id: string, gameId: string): Promise<boolean> => {
    const {
      lastPlayerKilled,
    }: LeanGameDocument = await this.gameRepository.getById(gameId);
    if (lastPlayerKilled._id.toString() === _id)
      await this.gameRepository.update(gameId, { lastPlayerKilled: null });
    return true;
  };

  public nominate = async (
    playerToNominateId: string,
    nominatedById: string,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(
      playerToNominateId,
      nominatedById,
    );
    const updatedGame: LeanGameDocument = await this.gameRepository.getById(
      gameId,
    );
    const {
      nominatedPlayers,
      alivePlayers,
    }: NominatedAndAliveAndMafiaPlayers = this.getNominatedAndAliveAndMafiaPlayers(
      updatedGame.players,
    );

    console.log(
      'NOMINATED PLAYERS ARE',
      nominatedPlayers.map(
        ({ name, nominatedBy }) =>
          `${name}, nominated by ${nominatedBy.map(({ name }) => name)}`,
      ),
    );

    //TODO: ACCOUNT FOR PLAYER NOMINATING THEMSELVES

    if (this.twoPlayersNominated(nominatedPlayers, alivePlayers)) {
      await Promise.all(
        updatedGame.players.map((player: Player) =>
          this.playerRepository.updateById(player._id, { nominatedBy: [] }),
        ),
      );
      return this.gameRepository.update(gameId, {
        nominatedPlayers,
        stage: TWO_NOMINATIONS,
      });
    }
    return this.gameRepository.update(gameId, { nominatedPlayers });
  };

  public lynch = async (
    playerToLynchId: string,
    nominatedById: string,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(
      playerToLynchId,
      nominatedById,
    );
    const updatedGame: LeanGameDocument = await this.gameRepository.getById(
      gameId,
    );

    const {
      nominatedPlayers,
      alivePlayers,
    }: NominatedAndAliveAndMafiaPlayers = this.getNominatedAndAliveAndMafiaPlayers(
      updatedGame.players,
    );

    if (this.allPlayersVoted(nominatedPlayers, alivePlayers)) {
      return this.decideLynchedPlayer(nominatedPlayers, gameId, updatedGame);
    }
    return updatedGame;
  };

  private decideLynchedPlayer = async (
    nominatedPlayers: Player[],
    gameId: string,
    updatedGame: LeanGameDocument,
  ): Promise<LeanGameDocument> => {
    if (
      nominatedPlayers[0].nominatedBy.length ===
      nominatedPlayers[1].nominatedBy.length
    ) {
      return this.gameRepository.update(gameId, {
        stage: TIE,
      });
    }
    const lynchedPlayer: Player =
      nominatedPlayers[0].nominatedBy.length >
      nominatedPlayers[1].nominatedBy.length
        ? nominatedPlayers[0]
        : nominatedPlayers[1];

    await Promise.all(
      updatedGame.players.map(({ _id }: Player) =>
        _id === lynchedPlayer._id
          ? this.playerRepository.updateById(_id, {
              isAlive: false,
              nominatedBy: [],
            })
          : this.playerRepository.updateById(_id, { nominatedBy: [] }),
      ),
    );

    return this.gameRepository.update(gameId, {
      lastPlayerKilled: lynchedPlayer,
      stage: PLAYER_LYNCHED,
    });
  };

  private getNominatedAndAliveAndMafiaPlayers = (
    players: Player[],
  ): NominatedAndAliveAndMafiaPlayers => {
    const nominatedPlayers: Player[] = players.filter(
      ({ nominatedBy }: Player) => nominatedBy.length,
    );

    const alivePlayers: Player[] = players.filter(
      ({ isAlive }: Player) => isAlive,
    );

    const mafiaPlayers: Player[] = players.filter(
      ({ role }: Player) => role === MAFIA,
    );

    return { nominatedPlayers, alivePlayers, mafiaPlayers };
  };

  private twoPlayersNominated = (
    nominatedPlayers: Player[],
    alivePlayers: Player[],
  ): boolean =>
    nominatedPlayers.length === 2 &&
    nominatedPlayers.reduce(
      (acc: Player[], { nominatedBy }: Player) => [...acc, ...nominatedBy],
      [],
    ).length === alivePlayers.length;

  private allPlayersVoted = (
    nominatedPlayers: Player[],
    alivePlayers: Player[],
  ): boolean =>
    nominatedPlayers.reduce(
      (acc: Player[], { nominatedBy }: Player) => [...acc, ...nominatedBy],
      [],
    ).length === alivePlayers.length;
}

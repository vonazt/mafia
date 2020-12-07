import { Service, Inject } from 'typedi';
import { LeanPlayerDocument } from '../DomainObjects/Mongoose/PlayerDocuments';
import { LeanGameDocument } from '../DomainObjects/Mongoose/GameDocuments';
import {
  NominatedAndAliveAndMafiaPlayers,
  Player,
} from '../DomainObjects/Player';
import { IPlayerRepository } from '../Repositories/PlayerRepository';
import { IGameRepository } from '../Repositories/GameRepository';

export interface IPlayerService {
  add: (
    gameId: string,
    player: Player,
    socketId: string,
  ) => Promise<LeanGameDocument>;
  assassinate: (
    player: Player,
    mafiaHitman: Player,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  confirmAssassination: (
    killPlayerplayerToDie: Player,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  investigate: (playerToInvestigate: Player) => Promise<boolean>;
  nominate: (
    playerToNominate: Player,
    nominatedBy: Player,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  lynch: (
    playerToLynch: Player,
    nominatedBy: Player,
    gameId: string,
  ) => Promise<LeanGameDocument>;
  reconnect: (player: Player, socketId: string) => Promise<LeanPlayerDocument>;
  disconnectFromGame: (socketId: string) => Promise<LeanPlayerDocument>;
}
@Service()
export default class PlayerService implements IPlayerService {
  constructor(
    @Inject(`PLAYER_SERVICE`)
    private playerRepository: IPlayerRepository,
    private gameRepository: IGameRepository,
  ) {}
  public add = async (
    gameId: string,
    player: Player,
    socketId: string,
  ): Promise<LeanGameDocument> => {
    const { players }: LeanGameDocument = await this.gameRepository.getById(
      gameId,
    );
    const playerAlreadyInGame: Player = players.find(
      ({ name }: Player) => name === player.name,
    );

    if (!playerAlreadyInGame) {
      const newPlayer = await this.playerRepository.create({
        name: player.name,
        socketId,
      });
      return this.gameRepository.update(gameId, {
        $addToSet: {
          players: newPlayer._id,
        },
      });
    }
    await this.playerRepository.reconnect(playerAlreadyInGame, socketId);

    return this.gameRepository.getById(gameId);
  };

  public assassinate = async (
    player: Player,
    mafiaHitman: Player,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(player, mafiaHitman);
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
    return updatedGame;
  };

  public confirmAssassination = async (
    playerToDie: Player,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    const lastPlayerKilled: Player = await this.playerRepository.updateById(
      playerToDie._id,
      {
        isAlive: false,
        nominatedBy: [],
      },
    );

    return this.gameRepository.update(gameId, {
      lastPlayerKilled,
      nominatedPlayers: [],
      $set: {
        'stages.mafiaAwake': false,
        'stages.detectiveAwake': true,
      },
    });
  };

  public investigate = async (
    playerToInvestigate: Player,
  ): Promise<boolean> => {
    const { role }: LeanPlayerDocument = await this.playerRepository.getById(
      playerToInvestigate._id,
      `role`,
    );
    console.log('ROLE IS', role);
    return role === `mafia`;
  };

  public nominate = async (
    playerToNominate: Player,
    nominatedBy: Player,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(
      playerToNominate,
      nominatedBy,
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
    //TODO: ACCOUNT FOR PLAYER NOMINATING THEMSELVES

    console.log(
      'TWO PLAYERS NOMINTED',
      this.twoPlayersNominated(nominatedPlayers, alivePlayers),
    );
    if (this.twoPlayersNominated(nominatedPlayers, alivePlayers)) {
      await Promise.all(
        updatedGame.players.map((player: Player) =>
          this.playerRepository.updateById(player._id, { nominatedBy: [] }),
        ),
      );
      return this.gameRepository.update(gameId, {
        nominatedPlayers,
        $set: { 'stages.day': false, 'stages.twoNominations': true },
      });
    }
    return this.gameRepository.update(gameId, { nominatedPlayers });
  };

  public lynch = async (
    playerToLynch: Player,
    nominatedBy: Player,
    gameId: string,
  ): Promise<LeanGameDocument> => {
    await this.playerRepository.updateNominations(playerToLynch, nominatedBy);
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

  public disconnectFromGame = this.playerRepository.disconnectFromGame;

  public reconnect = this.playerRepository.reconnect;

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
        $set: { 'stages.twoNominations': false, 'stages.tie': true },
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
      $set: {
        'stages.twoNominations': false,
        'stages.tie': false,
        'stages.playerLynched': true,
      },
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
      ({ role }: Player) => role === `mafia`,
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

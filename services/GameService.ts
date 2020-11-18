import { IGameRepository } from '../Repositories/GameRepository';
import {
  IGameDocument,
  LeanGameDocument,
  Stages,
} from '../DomainObjects/Mongoose/GameDocuments';
import { Player } from '../DomainObjects/Player';
import { IPlayerRepository } from '../Repositories/PlayerRepository';

export interface IGameService {
  create: () => Promise<IGameDocument>;
  join: (gameId: string) => Promise<Player[]>;
  start: (gameId: string) => Promise<LeanGameDocument>;
  endDetectiveTurn: (gameId: string) => Promise<LeanGameDocument>;
}

export default class GameService implements IGameService {
  constructor(
    private gameRepository: IGameRepository,
    private playerRepository: IPlayerRepository,
  ) {}

  public create = this.gameRepository.create;

  public join = this.gameRepository.join;

  public start = async (gameId: string): Promise<LeanGameDocument> => {
    const players: Player[] = await this.gameRepository.listPlayersInGame(
      gameId,
    );
    const roles: string[] = this.createRoles(players);
    const playersWithAssignedRoles: Player[] = players.map(
      (player: Player, index: number) => ({
        ...player,
        role: roles[index],
      }),
    );
    await Promise.all(
      playersWithAssignedRoles.map(({ _id, role }: Player) =>
        this.playerRepository.updateById(_id, { role }),
      ),
    );
    return this.gameRepository.update(gameId, {
      players: players.map(({ _id }: Player) => _id),
      $set: { 'stages.intro': false, 'stages.mafiaAwake': true },
    });
  };

  public endDetectiveTurn = async (
    gameId: string,
  ): Promise<LeanGameDocument> => {
    const { players, stages }: LeanGameDocument = await this.gameRepository.getById(gameId);
    const gameHasGuardianAngel: Player = players.find(
      ({ role }: Player) => role === `guardianAngel`,
    );

    const updatedStages: Stages = gameHasGuardianAngel
      ? { ...stages, detectiveAwake: false, guardianAngelAwake: true }
      : {
          ...stages,
          detectiveAwake: false,
          day: true,
        };
    return this.gameRepository.update(gameId, { stages: updatedStages });
  };

  public quit = this.gameRepository.quit;

  private shuffleRoles = (roles: string[]): string[] => {
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    return roles;
  };

  private createRoles = (players: Player[]): string[] => {
    const numberOfPlayers: number = players.length;
    const numberOfMafia: number = Math.floor(numberOfPlayers / 5);
    const numberOfDetectives: number = Math.ceil(numberOfMafia / 3);
    const numberOfGuardianAngels: number = Math.floor(numberOfPlayers / 10);
    const numberOfCivilians: number =
      numberOfPlayers -
      numberOfMafia -
      numberOfDetectives -
      numberOfGuardianAngels;
    const mafiaRoles: string[] = this.getRolesArray(numberOfMafia, `mafia`);
    const detectiveRoles: string[] = this.getRolesArray(
      numberOfDetectives,
      `detective`,
    );
    const guardianAngelRoles: string[] = this.getRolesArray(
      numberOfGuardianAngels,
      `guardianAngel`,
    );
    const civilianRoles: string[] = this.getRolesArray(
      numberOfCivilians,
      `civilian`,
    );

    const combinedRoles: string[] = [
      ...mafiaRoles,
      ...civilianRoles,
      ...detectiveRoles,
      ...guardianAngelRoles,
    ];
    return this.shuffleRoles(combinedRoles);
  };

  private getRolesArray = (numberOfRoles: number, role: string): string[] =>
    Array.from(Array(numberOfRoles)).map(() => role);
}

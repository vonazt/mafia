import { IGameRepository } from '../repositories/GameRepository';
import {
  IGameDocument,
  LeanGameDocument,
} from '../DomainObjects/Mongoose/GameDocuments';
import { Player } from '../DomainObjects/Player';

export interface IGameService {
  create: () => Promise<IGameDocument>;
  join: (gameId: string) => Promise<Player[]>;
  start: (gameId: string) => Promise<LeanGameDocument>;
}

export default class GameService implements IGameService {
  constructor(private gameRepository: IGameRepository) {}

  public create = async (): Promise<IGameDocument> =>
    this.gameRepository.create();

  public join = async (gameId: string): Promise<Player[]> =>
    this.gameRepository.join(gameId);

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
    return this.gameRepository.start(gameId, playersWithAssignedRoles);
  };

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

import sqlite, { Database, Statement } from 'sqlite';
import { v4 as uuid } from 'uuid';
import lock from '../lock';
import Artist from './model/Artist';

export class ChinookService {
    private static readonly artistSelect = 'select ArtistId as id, Name as name from artists';

    private file: string;
    private lockId: string;
    private db: Database | undefined;

    constructor(file: string) {
        this.file = file;
        this.lockId = uuid();
    }

    public async artist(id: number): Promise<Artist> {
        return this.get<Artist>(`${ChinookService.artistSelect} where ArtistId = ?`, id);
    }

    public async artistsByName(nameLike: string): Promise<Artist[]> {
        return this.all<Artist>(`${ChinookService.artistSelect} where Name like ? order by Name`, nameLike);
    }

    public async artists(): Promise<Artist[]> {
        return this.all<Artist>(ChinookService.artistSelect);
    }

    public async testConnection(): Promise<void> {
        await this.database();
    }

    public async database(): Promise<Database> {
        if (this.db) {
            return this.db;
        }

        return lock.acquire(this.lockId, async () => {
            if (this.db) {
                return this.db;
            }

            return (this.db = await sqlite.open(this.file));
        });
    }

    private async get<T>(sql: string, ...params: any[]): Promise<T> {
        const database = await this.database();
        const result = await database.get(sql, params);
        console.log(`sql: ${sql}`, result);
        return result;
    }

    private async all<T>(sql: string, ...params: any[]): Promise<T[]> {
        const database = await this.database();
        const results = await database.all(sql, params);
        console.log(`sql: ${sql} returned ${results.length} results`);
        return results;
    }

    private async run(sql: string, ...params: any[]): Promise<Statement> {
        const database = await this.database();
        const statement = await database.run(sql, params);
        return statement;
    }

    private async prepare(sql: string, ...params: any[]): Promise<Statement> {
        const database = await this.database();
        return database.prepare(sql, params);
    }
}

import sqlite, { Database, Statement } from 'sqlite';
import { v4 as uuid } from 'uuid';
import lock from '../lock';
import Artist from './model/Artist';
import Track from './model/Track';
import Album from './model/Album';

export class ChinookService {
    private static readonly artistSelect = 'select ArtistId as id, Name as name from artists';
    private static readonly albumSelect = 'select AlbumId as id, Title as title from albums';
    private static readonly trackSelect = `
        select 
            TrackId as id, 
            Name as name, 
            Composer as composer, 
            Milliseconds as milliseconds, 
            Bytes as bytes, 
            unitPrice as unitPrice 
        from tracks`;

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

    public async album(id: number): Promise<Album[]> {
        return this.all<Album>(`${ChinookService.albumSelect} where AlbumId = ?`, id);
    }

    public async albums(): Promise<Album[]> {
        return this.all<Album>(ChinookService.albumSelect);
    }

    public async albumsByTitle(titleLike: string): Promise<Album[]> {
        return this.all<Album>(`${ChinookService.albumSelect} where Title like ? order by Title`, titleLike);
    }

    public async albumsByArtist(artistId: number): Promise<Album[]> {
        return this.all<Album>(`${ChinookService.albumSelect} where ArtistId = ? order by Title`, artistId);
    }

    public async tracksByAlbum(albumId: number): Promise<Track[]> {
        return this.all<Track>(`${ChinookService.trackSelect} where AlbumId = ?`, albumId);
    }

    public async tracksByComposer(composerLike: string): Promise<Track[]> {
        return this.all<Track>(`${ChinookService.trackSelect} where Composer like ? order by Name`, composerLike);
    }

    public async insertArtist(name: string): Promise<Artist> {
        const statement = await this.run('insert into Artists (Name) values (?)', name);
        return {
            id: statement.lastID,
            name,
            albums: [],
        };
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
}

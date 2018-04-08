import { ChinookService } from './data/ChinookService';
import Artist from './data/model/Artist';
import Album from './data/model/Album';

const chinookService = new ChinookService('./data/db/chinook.db');

export const resolvers: any = {
    Query: {
        artists: async () => chinookService.artists(),
        artist: async (source: any, { id }: { id: number }) => chinookService.artist(id),
        artistsByName: async (source: any, { nameLike }: { nameLike: string }) =>
            chinookService.artistsByName(nameLike),
        albums: async () => chinookService.albums(),
        album: async (source: any, { id }: { id: number }) => chinookService.album(id),
        albumsByTitle: async (source: any, { titleLike }: { titleLike: string }) =>
            chinookService.albumsByTitle(titleLike),
        tracksByComposer: async (source: any, { composerLike }: { composerLike: string }) =>
            chinookService.tracksByComposer(composerLike),
    },
    Artist: {
        albums: async (source: Artist) => chinookService.albumsByArtist(source.id),
    },
    Album: {
        tracks: async (source: Album) => chinookService.tracksByAlbum(source.id),
    },
};
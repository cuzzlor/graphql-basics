import { ChinookService } from './data/ChinookService';

const chinookService = new ChinookService('./data/db/chinook.db');

export const resolvers: any = {
    Query: {
        artists: async () => chinookService.artists(),
        artist: async (source: any, { id }: { id: number }) => chinookService.artist(id),
        artistsByName: async (source: any, { nameLike }: { nameLike: string }) =>
            chinookService.artistsByName(nameLike),
    },
};

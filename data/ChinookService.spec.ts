import 'mocha';
import { ChinookService } from './ChinookService';

describe('ChinookService', () => {
    const databaseFile = './data/db/chinook.db';

    describe('#testConnection', () => {
        it('should connect', async () => {
            return new ChinookService(databaseFile).testConnection();
        });
    });

    describe('#artists', () => {
        it('should return artists', async () => {
            const artists = await new ChinookService(databaseFile).artists();
            console.log(artists);
        });
    });

    describe('#artist', () => {
        it('should return a single artist', async () => {
            const artist = await new ChinookService(databaseFile).artist(1);
            console.log(artist);
        });
    });

    describe('#artistsByNameLike %dc', () => {
        it('should return artists like the specified name', async () => {
            const artists = await new ChinookService(databaseFile).artistsByName('%dc');
            console.log(artists);
        });
    });

    describe('#albums', () => {
        it('should return albums', async () => {
            const albums = await new ChinookService(databaseFile).albums();
            console.log(albums);
        });
    });

    describe('#album', () => {
        it('should return a single album', async () => {
            const albums = await new ChinookService(databaseFile).album(1);
            console.log(albums);
        });
    });

    describe('#albumsByTitleLike back%', () => {
        it('should return albums matching the specified title', async () => {
            const albums = await new ChinookService(databaseFile).albumsByTitle('back%');
            console.log(albums);
        });
    });

    describe('#albumsByArtist', () => {
        it('should return albums for the specified artist', async () => {
            const albums = await new ChinookService(databaseFile).albumsByArtist(1);
            console.log(albums);
        });
    });

    describe('#tracksByAlbum', () => {
        it('should return tracks for the specified album', async () => {
            const tracks = await new ChinookService(databaseFile).tracksByAlbum(1);
            console.log(tracks);
        });
    });

    describe('#tracksByComposerLike %lars%', () => {
        it('should return tracks matching the specified composer', async () => {
            const albums = await new ChinookService(databaseFile).tracksByComposer('%lars%');
            console.log(albums);
        });
    });
});

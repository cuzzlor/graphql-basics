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
});

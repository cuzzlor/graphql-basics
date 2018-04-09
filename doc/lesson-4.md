# Lesson 4 - Add Albums, Tracks and a Mutation

In this lesson we will:

* Finish the Query API adding relationships for Artists > Albums > Track.
* Add a mutation to insert Artists, plus Albums with Tracks.

## Step 1 - Add Albums and Tracks

1.  Update `schema.graphql` to link up Artists > Albums > Tracks

    ```graphql
    type Artist {
        id: Int!
        name: String!
        albums: [Album]
    }

    type Album {
        id: Int!
        title: String!
        tracks: [Track]
    }

    type Track {
        id: Int!
        name: String!
        composer: String
        milliseconds: Int
        bytes: Int
        unitPrice: Float
    }

    type Query { ...
    ```

2.  Add definitions for `Album` and `Track` and add `albums` to `Artist` in our model

    `model/Track.ts`

    ```ts
    export default interface Track {
      id: number;
      name: string;
      composer: string;
      milliseconds: number;
      bytes: number;
      unitPrice: number;
    };
    ```

    `model/Album.ts`

    ```ts
    import Track from "./Track";

    export default interface Album {
      id: number;
      title: string;
      tracks: Track[];
    };
    ```

    `model/Artist.ts`

    ```ts
    import Album from "./Album";

    export default interface Artist {
      id: number;
      name: string;
      albums: Album[];
    };
    ```

3.  Add the _album_ and _track_ select statements and data access methods to the top of `ChinookService.ts`

    ```ts
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

        public async testConnection(): Promise<void> {
    	...
    ```

    > Add the required imports using VS Code quick fix (Ctrl+. or Ctrl+Enter)

4.  Add corresponding _album_ and _track_ tests to `ChinookService.spec.ts`

    ```ts
    describe("#albums", () => {
      it("should return albums", async () => {
        const albums = await new ChinookService(databaseFile).albums();
        console.log(albums);
      });
    });

    describe("#album", () => {
      it("should return a single album", async () => {
        const albums = await new ChinookService(databaseFile).album(1);
        console.log(albums);
      });
    });

    describe("#albumsByTitleLike back%", () => {
      it("should return albums matching the specified title", async () => {
        const albums = await new ChinookService(databaseFile).albumsByTitle(
          "back%"
        );
        console.log(albums);
      });
    });

    describe("#albumsByArtist", () => {
      it("should return albums for the specified artist", async () => {
        const albums = await new ChinookService(databaseFile).albumsByArtist(1);
        console.log(albums);
      });
    });

    describe("#tracksByAlbum", () => {
      it("should return tracks for the specified album", async () => {
        const tracks = await new ChinookService(databaseFile).tracksByAlbum(1);
        console.log(tracks);
      });
    });

    describe("#tracksByComposerLike %lars%", () => {
      it("should return tracks matching the specified composer", async () => {
        const albums = await new ChinookService(databaseFile).tracksByComposer(
          "%lars%"
        );
        console.log(albums);
      });
    });
    ```

    > ✔ If the Mocha sidebar is running all the new tests should appear and turn green

5.  Add `Artist` and `Album` entries with `albums` and `tracks` functions in `resolvers.ts`.

    Add them below the `Query` member..

    ```ts
    Query {
    	...
    },
    Artist: {
        albums: async (source: Artist) => chinookService.albumsByArtist(source.id),
    },
    Album: {
        tracks: async (source: Album) => chinookService.tracksByAlbum(source.id),
    },
    ```

    > Note that the parent object instance will be the first `source` resolver argument.
    > We're not using `args` this time, although you'd often include optional filtering, paging or ordering parameters.

### Run it...

> Experiment running different queries returning albums and tracks for artists, e.g.

```graphql
{
  artist(id: 1) {
    name
    albums {
      title
      tracks {
        name
        composer
        milliseconds
        bytes
        unitPrice
      }
    }
  }
}
```

## Step 2 - Add a top level Query functions for Albums

> This simply adds in another entry point for querying Albums and Tracks without going through Artists.

1.  Add functions into the `Query` definition in `schema.graphql`

    ```graphql
    """
    Returns all albums
    """
    albums: [Album]

    """
    Finds an album by id
    """
    album(id: Int!): Album

    """
    Finds albums with a matching title.

    Supports \`%\` \`like\` syntax.
    """
    albumsByTitle(titleLike: String!): [Album]

    """
    Finds tracks with a matching composer.

    Supports \`%\` \`like\` syntax.
    """
    tracksByComposer(composerLike: String!): [Track]
    ```

2.  Add the corresponding resolver functions to `Query` in `resolvers.ts`

    ```ts
    albums: async () => chinookService.albums(),
    album: async (source: any, { id }: { id: number }) => chinookService.album(id),
    albumsByTitle: async (source: any, { titleLike }: { titleLike: string }) =>
        chinookService.albumsByTitle(titleLike),
    tracksByComposer: async (source: any, { composerLike }: { composerLike: string }) =>
        chinookService.tracksByComposer(composerLike),
    ```

### Run it...

> Experiment running different album and track queries, e.g.

```graphql
{
  tracksByComposer(composerLike: "%kirk%") {
    name
    composer
    milliseconds
    bytes
    unitPrice
  }

  albums {
    title
  }
}
```

## Step 3 - Add a simple Mutation to create an Artist

1.  Add an `insertArtist` function to `ChinookService.ts`

    ```ts
    public async insertArtist(name: string): Promise<Artist> {
        const statement = await this.run('insert into Artists (Name) values (?)', name);
        return {
            id: statement.lastID,
            name,
            albums: [],
        };
    }
    ```

2.  Add a test to `ChinookService.spec.ts`

    ```ts
    describe("#insertArtist", () => {
      it("should create a single artist", async () => {
        const artist = await new ChinookService(databaseFile).insertArtist(
          "The Dirty Floors"
        );
        console.log(artist);
      });
    });
    ```

3.  Add a `Mutation` entry with a `createArtist` function in `resolvers.ts`

    ```ts
    ...
    Mutation: {
        createArtist: async (source: any, { name }: { name: string }) => chinookService.insertArtist(name),
    },
    ```

4.  Add a Mutation type to `schema.graphql`

    ```graphql
    type Mutation {
      createArtist(name: String!): Artist
    }
    ```

### Run it...

```graphql
mutation {
  createArtist(name: "Broken Code") {
    id
    name
  }
}
```

## Step 3 - Add a Mutation to create an Album with Tracks

1.  Add an `insertArtist` function to `ChinookService.ts`

    ```ts
    public async insertAlbum(artistId: number, title: string, tracks: Track[]): Promise<Album> {
        const albumInsertStatement = await this.run(
            'insert into Albums (Title, ArtistId) values (?, ?)',
            title,
            artistId,
        );
        const album: Album = {
            id: albumInsertStatement.lastID,
            title,
            tracks,
        };

        const trackInsertStatement = await this.prepare(
            'insert into Tracks (AlbumId, Name, Composer, Milliseconds, Bytes, UnitPrice, MediaTypeId) values (?, ?, ?, ?, ?, ?, ?)',
        );

        await Promise.all(
            tracks.map(async track => {
                const statement = await trackInsertStatement.run(
                    album.id,
                    track.name,
                    track.composer,
                    track.milliseconds,
                    track.bytes,
                    track.unitPrice,
                    5, // <<< 'AAC Audio File'
                );
                track.id = statement.lastID;
            }),
        );

        return album;
    }
    ```

2.  Add a second `Mutation` function `createAlbum` in `resolvers.ts`

    ```ts
    Mutation: {
        ...
        createAlbum: async (
            source: any,
            { artistId, title, tracks }: { artistId: number; title: string; tracks: Track[] },
        ) => chinookService.insertAlbum(artistId, title, tracks),
    },
    ```

3.  Add a `TrackInput` type to `schema.graphql`

    ```graphql
    input TrackInput {
      name: String!
      composer: String
      milliseconds: Int
      bytes: Int
      unitPrice: Float
    }
    ```

4.  Add a second `Mutation` function for `createAlbum` in `schema.graphql`

    ```graphql
    type Mutation {
        ...
        createAlbum(artistId: Int!, title: String!, tracks: [TrackInput]): Album
    }
    ```

### Run it...

#### Query

```graphql
mutation($artistId: Int!, $title: String!, $tracks: [TrackInput]) {
  createAlbum(artistId: $artistId, title: $title, tracks: $tracks) {
    id
    title
    tracks {
      id
      name
      composer
      milliseconds
      bytes
    }
  }
}
```

#### Query Variables

```json
{
  "artistId": 284,
  "title": "Classic Hits",
  "tracks": [
    {
      "name": "I Love Work",
      "milliseconds": 3000,
      "bytes": 100,
      "unitPrice": 0.99
    },
    {
      "name": "I Love My Wife",
      "milliseconds": 4050,
      "bytes": 200,
      "unitPrice": 0.99
    }
  ]
}
```

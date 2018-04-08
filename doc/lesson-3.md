# Lesson # 3 - Add SQLite to GraphQL API

In this lesson, you'll build a sqlite service for the chinook sample database, add some tests and basic API methods.

We will also split the contents of `app.ts` into separate schema and resolver map files.

**Note**: to skip downloading of the database file and diagram, run: `git checkout lesson3-start` before starting.
  
## Step 1 - Add sqlite, mocha and chai packages and types

```
npm install sqlite mocha chai async-lock uuid -s
npm install @types/mocha @types/chai @types/async-lock @types/uuid -D
```

## Step 2 - Add the database file and diagram

*Skip this step if you've already checked out the `lesson3-start` branch.*

 1. Create a `data` folder
 2. Create a `data/db` folder
 3. Create a `data/model` folder
 4. Extract the [database file](http://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip) to `data/db/chinook.db`
 5. Download the [database diagram](http://www.sqlitetutorial.net/wp-content/uploads/2018/03/sqlite-sample-database-diagram-color.pdf) to `data/db/diagram.pdf`

## Step 3 - Create the ChinookService and tests

 1. Create an application level `AsyncLock` exported instance
 
	 `lock.ts`
	```ts
	import AsyncLock from 'async-lock';
	const lock = new AsyncLock();
	export default lock;
	```

 2. Add `es2015` to the `lib` section in `tsconfig.json` so we can use the `Promise<T>` class.
	
	```json
	"lib": ["es2015"],
	```

 3. Create a skeleton data service for the chinook database

	`data/ChinookService.ts`
	```ts
	import sqlite, { Database, Statement } from 'sqlite';
	import { v4 as uuid } from 'uuid';
	import lock from '../lock';

	export class ChinookService {

	    private file: string;
	    private lockId: string;
	    private db: Database | undefined;

	    constructor(file: string) {
	        this.file = file;
	        this.lockId = uuid();
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

	            return this.db = await sqlite.open(this.file);
	        });
	    }

	    private async get<T>(sql: string, ...params: any[]) : Promise<T> {
	        const database = await this.database();
	        const result = await database.get(sql, params);
	        console.log(`sql: ${sql}`, result);
	        return result;
	    }

	    private async all<T>(sql: string, ...params: any[]) : Promise<T[]> {
	        const database = await this.database();
	        const results = await database.all(sql, params);
	        console.log(`sql: ${sql} returned ${results.length} results`);
	        return results;
	    }

	    private async run(sql: string, ...params: any[]) : Promise<Statement> {
	        const database = await this.database();
	        return await database.run(sql, params);
	    }
	    
	    private async prepare(sql: string, ...params: any[]): Promise<Statement> {
	        const database = await this.database();
	        return database.prepare(sql, params);
	    }
	}
	```

	> Note: `async-lock` is used to avoid re-entrant calls when lazy loading the database connection per-instance-scope and it is hit with multiple parallel resolver calls.

 4. Create tests for ChinookService

	`data/ChinookService.spec.ts`

	```ts
	import 'mocha';
	import { ChinookService } from './ChinookService';

	describe('ChinookService', () => {

	    const databaseFile = './data/db/chinook.db';

	    describe('#testConnection', () => {
	        it('should connect', async () => {
	            return new ChinookService(databaseFile).testConnection();
	        });
	    });

	});
	```

 5. Run the test:

	```
	npm run test
	```

	Or, use the **debug current test** or **debug all tests** launch configurations from the debug tab.

	> Note: I have trouble setting breakpoints and debugging with mocha and ts-node :(

## Step 4 - Install and configure the Mocha sidebar extension

 1. Install **Mocha sidebar** extension and restart VS Code
 
 2. Open **Workspace Settings** (_File > Preferences > Settings_) and add these entries

	```json
	"mocha.files.glob": "./**/*spec.ts",
	"mocha.requires": ["ts-node/register"]
	```

3. Open the MOCHA sidebar at the bottom of the EXPLORER tab and press play.
	
	> ✔ Tests should automatically load and run in the background and show green or red as you code them.
	> ✔ Pass / fail count should show on the status bar

## Step 5 - Map Artists and add to the GraphQL API

 1. Install the **GraphQL for VSCode** extension and restart VS Code. This will give us syntax highlighting and auto-completion for our schema definition.

 2. Create `schema.graphql`

	```graphql
	type Artist {
	    id: Int!
	    name: String!
	}

	type Query {
	    """
	    Finds an artist by id
	    """
	    artist(id: Int!): Artist

	    """
	    Finds artists with a matching name.

	    Supports \`%\` \`like\` syntax.
	    """
	    artistsByName(nameLike: String!): [Artist]

	    """
	    Returns all artists
	    """
	    artists: [Artist]
	}
	```
 3. Create `/data/model/Artist.ts`
	```ts
	 export default interface Artist {
	    id: number;
	    name: string;
	}
	```
 
 4. Add a select statement string to the top of `ChinookService.ts`
	```ts
	export class ChinookService {
		 private static readonly artistSelect = 'select ArtistId as id, Name as name from artists';
	```
	
 5. Add some data access methods to  `ChinookService.ts` below the constructor
	```ts
    public async artist(id: number): Promise<Artist> {
        return this.get<Artist>(`${ChinookService.artistSelect} where ArtistId = ?`, id);
    }

    public async artistsByName(nameLike: string): Promise<Artist[]> {
        return this.all<Artist>(`${ChinookService.artistSelect} where Name like ? order by Name`, nameLike);
    }

    public async artists(): Promise<Artist[]> {
        return this.all<Artist>(ChinookService.artistSelect);
    }
	```
	> Use VS Code quick fix (Ctrl+. or Ctrl+Enter) to automatically add imports

 6. Add some more basic tests to `ChinookService.spec.ts`
 
	 > Start the mocha sidebar (if it isn't already running) so the new tests are picked up and run as you add them

	```ts
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
	```

 7. Create `resolvers.ts` containing our Artist resolver methods

	```ts
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
	```
	> Normally we'd place some kind of batching & caching layer between our resolvers and backends, e.g. the [Facebook Dataloader](https://github.com/facebook/dataloader).

 8. Update the top part of `app.ts` to read the schema file and import our resolver map
 
	```ts
	import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
	import bodyParser from 'body-parser';
	import express from 'express';
	import * as fs from 'fs';
	import { makeExecutableSchema } from 'graphql-tools';
	import { resolvers } from './resolvers';

	const typeDefs = fs.readFileSync('./schema.graphql', 'utf8');

	const schema = makeExecutableSchema({
	    typeDefs,
	    resolvers,
	});
	```

 9. Run your app and test your new query methods using the following query
 
	```graphql
	{
	  artist(id: 1) {
	    id
	    name
	  }
	  
	  artistsByName(nameLike: "%AC%") {
	    id
	    name
	  }
	  
	  artists {
	    id
	    name
	  }
	}
	```

### Review Time
> ✔ What we have built is OK but quite boring, almost the equivalent of a restful API. 
> ✔ GraphQL will really start to shine when we expand our object graph in Lesson 4...
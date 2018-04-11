# Lesson # 5 - Consuming GraphQL

## React, Relay, Connections...

There's a whole world of graphql stuff based around supporting next-gen fancy React clients. I haven't even skimmed the surface, but the existence of these things must be mentioned before discussing more basic client consumption of a graphql endpoint.

### Relay

[Relay](https://github.com/graphql/graphql-relay-js) is a graphql client framework for React apps. The use of Relay also has [server-side implications](https://dev-blog.apollodata.com/explaining-graphql-connections-c48b7c3d6976) - it's a whole 'nother world, out of the scope of this 'basics' workshop.

### Subscriptions

The third _thing_ graphql supports, in addition to **queries** and **mutations**, is **subscriptions** via the WebSockets protocol. This of course requires some kind of underlying Pub/Sub implementation and some additional server-side work.

Apollo has an [comprehensive tutorial](https://dev-blog.apollodata.com/tutorial-graphql-subscriptions-server-side-e51c32dc2951) on these subjects if you want to learn more.

## Old School HTTP

### Step # 1 - Static Query

For more traditional consumption, it's simply a case of request and response with JSON payloads. You don't need to use or write any special client to call graphql endpoints, but let's write one anyway.

1.  We'll use `axios` for as our HTTP client.

    ```
    npm install axios -s
    npm install @types/axios -D
    ```

2.  Here's an example of a very basic class to assist query operations. Create the following file:

    `client/DataService.ts`

    ```ts
    import axios from "axios";

    export default class DataService {
      private url: string;

      constructor(url: string) {
        this.url = url;
      }

      public async query<T, TVariables>(
        query: string,
        variables?: TVariables
      ): Promise<T> {
        return axios
          .post(this.url, { query, variables })
          .then(response => response.data as T)
          .catch(error => {
            throw error;
          });
      }
    }
    ```

3.  Now write a program to call your API:

    `client/app.ts`

    ```ts
    import DataService from "./DataService";

    const dataService = new DataService("http://localhost:3000/graphql");

    const query = `
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
    }`;

    dataService
      .query(query)
      .then(console.log)
      .catch(console.log);
    ```

4.  Create a new launch config to run your client app:

    ```json
    {
        "type": "node",
        "request": "launch",
        "name": "debug client app",
        "runtimeArgs": [
            "--inspect-brk=9220",
            "--nolazy",
            "-r",
            "ts-node/register",
            "${workspaceFolder}/client/app.ts"
        ],
        "cwd": "${workspaceFolder}/client",
        "console": "integratedTerminal",
        "internalConsoleOptions": "neverOpen",
        "port": 9220
    },
    ```

### Run it...

1.  First run your graphql API via the `debug` launch config.
2.  Then run your client app via the `debug client app` launch config.

> ✔ You should see console data output as you'd expect:

```json
{ data: { artist: { name: "AC/DC", albums: [Array] } } }
```

### Step # 2 - Parameterised Query

1.  Change your query to a named, paramaterised query in a file:

    `client/queries/artist-albums-tracks.graphql`

    ```graphql
    query ArtistAlbumsTracks($artistId: Int!) {
      artist(id: $artistId) {
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

2.  Change your client to use the new query and supply the input via a variables map:

    ```ts
    import DataService from "./DataService";
    import * as fs from "fs";

    const dataService = new DataService("http://localhost:3000/graphql");

    dataService
      .query(fs.readFileSync("queries/artist-albums-tracks.graphql", "utf8"), {
        artistId: 1
      })
      .then(console.log)
      .catch(console.log);
    ```

3.  Run your updated client, the output should be the same.

### Step # 3 - Use [Apollo GraphQL code generator](https://github.com/apollographql/apollo-codegen)

```
apollo-codegen introspect-schema http://localhost:3000/graphql --output schema.json
apollo-codegen generate artist-albums-tracks.graphql --schema schema.json --target typescript --output types/artist-albums-tracks.ts
```

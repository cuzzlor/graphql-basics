# Lesson # 5 - Consuming GraphQL

## React, Relay, Connections...

There's a whole world of graphql stuff based around supporting next-gen fancy React clients. I haven't even skimmed the surface, but the existence of these things must be mentioned before discussing more basic client consumption of a graphql endpoint.

### Relay

[Relay](https://github.com/graphql/graphql-relay-js) is a graphql client framework for React apps. The use of Relay also has [server-side implications](https://dev-blog.apollodata.com/explaining-graphql-connections-c48b7c3d6976) around how you design and implement your schema (connections, nodes, edges) - it's out of the scope of this 'basics' workshop.

### Subscriptions

The third _thing_ graphql supports, in addition to **queries** and **mutations**, is **subscriptions** via the WebSockets protocol. This of course requires some kind of underlying Pub/Sub implementation and some additional server-side work.

Apollo has an [comprehensive tutorial](https://dev-blog.apollodata.com/tutorial-graphql-subscriptions-server-side-e51c32dc2951) on these subjects if you want to learn more.

## HTTP Clients

Let's get back to the basics...

### Step # 1 - Static Query

For more traditional consumption, it's simply a case of request and response with JSON payloads. You don't need to use or write any special client to call graphql endpoints, but let's write one anyway.

1.  We'll use `axios` as our HTTP client.

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
          .then(response => response.data as T);
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

> ✔ You should see console output as you'd expect:

```
{ data: { artist: { name: "AC/DC", albums: [Array] } } }
```

### Step # 2 - Parameterised Query

1.  Change your query to a named and paramaterised query, in a file:

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

### Step # 3 - Use [Apollo GraphQL code generator](https://github.com/apollographql/apollo-codegen) to generate types

It makes sense that in a Typescript app we'd want to type the query input and output. right?

How can we do this when we declare our return type differently for every query? Should we just create a superset return type and make everything nullable?

Ummm, no, we can use the apollo-codegen package to generate types based on the schema and our query - both are parseable and well defined.

1.  Install apollo-codegen

    ```
    npm install apollo-codegen -D
    ```

2.  Introspect and download the remote schema to a local file.

    ```
    .\node_modules\.bin\apollo-codegen introspect-schema http://localhost:3000/graphql --output client/schema.json
    ```

3.  Create a directory for generated types: `client/types`

    e.g.

    ```
    mkdir client/types
    ```

4.  Generate input and output types, based on your query and the downloaded schema.

    ```
    .\node_modules\.bin\apollo-codegen generate client/queries/artist-albums-tracks.graphql --schema client/schema.json --target typescript --output client/types/artist-albums-tracks.ts
    ```

5.  Change your code to use the input and output types. The types are named according to your query name: `[query-name]Query` for output, and `[query-name]QueryVariables` for input.

    ```ts
    dataService
      .query<ArtistAlbumsTracksQuery,ArtistAlbumsTracksQueryVariables>(
          fs.readFileSync("queries/artist-albums-tracks.graphql", "utf8"), {
            artistId: 1
          });
    ```

6.  Import those types, run your updated client. The output should be the same, but you now have an output type definition to use throughout your client plus intellisense on the input!

> ✔ Go forth and reap the benefits of type definitions without having to write them!

## The End

That concludes the final lesson in this tutorial, I hope it helped gain an understanding of the basics of building a GraphQL API.

Please feel free to provide feedback or contribute via a pull request.

# Lesson # 2 - GraphQL Hello World

In this lesson we will learn the basics of writing GraphQL APIs.

## Step 1: Add GraphQL packages & types

We will use **apollo-server-express** for middleware and **graphql-tools** for building our schema.

```
npm install -s apollo-server-express body-parser graphql graphql-tools
npm install -D @types/graphql
```
### About these packages

The core graphql implementation is written by Facebook
 - https://github.com/graphql/graphql-js

 The server middleware and `graphql-tools` packages we have chosen to use are part of [Apollo](https://www.apollographql.com/): a *family of tools that enable developers to get the most out of GraphQL*, run by a company called [Meteor](https://www.meteor.io/), who *build open source tools and commercial services*.
 - https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
 - https://github.com/apollographql/graphql-tools

These are both written in Typescript.

Note that Apollo ship many server middlewares including:
- apollo-server-azure-functions
- apollo-server-lambda

## Step 2: Add Hello World code

Replace or amend app.ts to:

 1. Build a basic schema and resolver map
 2. Run GraphQL using the `graphqlExpress` middleware function
 3. Run the Graphiql IDE using the `graphiqlExpress` middleware function

```ts
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import express from 'express';
import { makeExecutableSchema } from 'graphql-tools';

// schema using GraphQL schema language
const typeDefs = `
    type Query {
        hello: String
    }
`;

// resolver map to execute the schema
const resolvers: any = {
    Query: {
        hello: () => 'Hello world!'
    }
}

// build the executable schema 
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const app = express();

// set up graphql
app.use(
    '/graphql', 
    bodyParser.json(), 
    graphqlExpress({
        schema
    })
);

// set up the graphql ide
app.use('/graphiql', 
    graphiqlExpress({
        endpointURL: '/graphql'
    })
);

app.listen(3000, () =>
    console.log(`Open http://localhost:3000/graphiql to run queries`)
);
```

## Step 3: Run your Hello World code

 1. Run the app
 2. Open http://localhost:3000/graphiql
 3. Run the *hello* query:
	```graphql
	{
	  hello
	}
	 ```

> ✔ Explore the IDE autocomplete
> ✔ Explore the IDE schema / documentation explorer

## Step 4: Quick look at GraphQL Schema Definition Language (SDL)*
**(also termed IDL - Interface Definition Language)*

http://graphql.org/learn/schema/

https://raw.githubusercontent.com/sogko/graphql-shorthand-notation-cheat-sheet/master/graphql-shorthand-notation-cheat-sheet.png

## Step 5: Review code-based vs SDL-based schema definition

No coding in this step, just reading.

### SDL based schema example

```ts
const typeDefs = `
    type User {
        id: String
        name: String
    }

    type Query {
        user(id: String): User
    }
`);

const resolvers: any = {
    Query: {
        user: (source: any, args: any) => fakeDatabase[args.id]
    }
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});
```

### Code based schema example

```ts
const userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
  }
});

const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      args: {
        id: { type: graphql.GraphQLString }
      },
      resolve: (source: any, args: any) => fakeDatabase[args.id]
    }
  }
});

var schema = new graphql.GraphQLSchema({query: queryType});
```

> ✔ Argue pros and cons
> ✔ Accept it has been declared that we shall go forth using SDL

## Step 6: Apply a directive & add arguments

http://graphql.org/learn/queries/#directives

 1. Change your schema to include the `@deprecated` directive against the `hello` query method and add a replacement `helloWorld`  which accepts a `from` argument

	```ts
	const typeDefs = `
	    type Query {
	        hello: String @deprecated(reason: "do not use this method, use helloWorld")
	        helloWorld(from: String): String
	    }
	`;
	```

 2. Add a resolver for the new method

	```ts
	const resolvers: any = {
	    Query: {
	        hello: () => 'Hello world!',
	        helloWorld: (source: any, args: any) => `Hello world from ${args.from}!`,
	    },
	};
	```

 3. Run it..
 
	```graphql
	{
	  hello
	  helloWorld(from:"[Your Name Here]")
	}
	 ```

> ✔ Check the behaviour of the GraphiQL IDE (and generated schema doc) with the deprecated field and the new query method.
> ✔ Check your argument works as expected.

You're probably wondering what the first resolver argument `source: any` is. This is used to pass down the parent object for resolution within a hierarchical object graph, but since `Query` is a top level object, `source` is `undefined`. You'll use this resolver argument later.

## Step 7: Make your argument required, using the non-null operator `!`

In the `typeDefs` schema string add the `!` operator after the type.
```graphql
helloWorld(from: String!): String
```

#### Extra option: use object destructuring syntax to type your resolver args

In the `resolvers` map...
```ts
helloWorld: (source: any, { from }: { from: string }) => `Hello world from ${from}!`,
```

### Run it..

> ✔ Test the query parsing behaviour of the GraphiQL IDE when the required argument is missing: http://localhost:3000/graphiql?query=%7B%0A%20%20helloWorld%0A%7D%0A

## Step 8: Add markdown documentation to your schema

```ts
const typeDefs = `
    """
    The top level query type
    """
    type Query {
        hello: String @deprecated(reason: "do not use this method, use helloWorld")
        """
        Returns a _custom_ hello world message
        """
        helloWorld(from: String!): String
    }
`;
```

### Run it..

> ✔ Check your documentation is shown in the schema explorer

## Step 9: Review the doc on `resolvers`

  http://graphql.org/learn/execution/

> ✔ Resolvers receive 4 arguments
> ✔ Resolvers can be async (functions that return a promise)
> ✔ Scalar coercion (e.g. resolving numbers to schema enums)
> ✔ Resolvers can return lists (of things or promises)

## Step 10: Review how clients could consume your API

  http://graphql.org/graphql-js/graphql-clients/

- The request can be a GET or POST, depending on server configuration.
- The request body, if used, is JSON; but the `query` field is a string (SDL is not JSON).
- The response is JSON.

#### Example Request

```json
{ "query":"{helloWorld(from:\"Sam\")}" }
```

#### Response

```json
{ "data": { "helloWorld": "Hello world from Sam!" } }
```

### Input Parameter Binding

> You do not need to interpolate and escape parameter values into the `query` string (yuck!). Instead, bind parameters using `$paramName` syntax and supply a `variables` map.

[Try using the variables tab in the Graphiql IDE](http://localhost:3000/graphiql?query=query%20%28$name:%20String!%29%20%7B%0A%20%20helloWorld%28from:%20$name%29%0A%7D%0A&variables=%7B%0A%20%20%22name%22:%20%22Sam%22%0A%7D)

#### Query
```graphql
query ($name: String!) {
  helloWorld(from: $name)
}
```

#### Query Variables
```json
{
  "name": "Sam"
}
```

This generates a request body which includes both `query` (SDL string) and `variables` (JSON map) properties set:


```json
{
	"query": "query ($name: String!) {helloWorld(from: $name)}",
	"variables": { "name": "Sam" }
}
```

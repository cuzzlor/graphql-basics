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

const app = express();

// set up graphql
app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress({
        schema,
    }),
);

// set up the graphql ide
app.use(
    '/graphiql',
    graphiqlExpress({
        endpointURL: '/graphql',
    }),
);

app.listen(3000, () => console.log(`Open http://localhost:3000/graphiql to run queries`));

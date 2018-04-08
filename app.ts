import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import express from 'express';
import { makeExecutableSchema } from 'graphql-tools';

// schema using GraphQL schema language
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
// resolver map to execute the schema
const resolvers: any = {
    Query: {
        hello: () => 'Hello world!',
        helloWorld: (source: any, { from }: { from: string }) => `Hello world from ${from}!`,
    },
};

// build the executable schema
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

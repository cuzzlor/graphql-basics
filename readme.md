# GraphQL Basics

In this workshop you'll build a [GraphQL](http://graphql.org/) API in Typescript using the SQLite chinook sample database using the following librarys (amongst others):

* [Node](https://nodejs.org) (runtime)
* [Express](https://expressjs.com/) (web server)
* [GraphQL](https://github.com/graphql/graphql-js) (GraphQL for JavaScript)
* [Apollo Server for Express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) (graphql server middleware)
* [GraphQL Tools](https://github.com/apollographql/graphql-tools)
* [GraphiQL](https://github.com/graphql/graphiql) (graphql browser-based IDE)
* [node-sqlite](https://github.com/kriasoft/node-sqlite) (sqlite async client)

## Prerequisites

Make sure you're set up before starting the workshop:

1.  Recent version of [NodeJS](https://nodejs.org/en/download/)
2.  Up to date [VS Code](https://code.visualstudio.com/download)
3.  Extensions for VS Code
    * TSLint
    * Prettier
4.  Remove any old typescript SDK entry from your system PATH (put there by old versions of VS).

## Workshop Structure

The workshop is split into 4 lessons which should take around 20-30 mins each if you copy and paste code into place and do some reading / thinking / playing along the way.

Branches have been created to capture the completed code at the end of each workshop, and at the end of each step in lesson 4.

If you have problems, just check out the branch corresponding to where you want to be.

e.g.

```
git checkout lesson2 -f
```

_You may need to also run an `npm install` after switching branches._

**Note: The workshop doc is only included in the master branch, so I suggest reading from the hosted repo rather than from local files.**

## Lessons

* [# 1 - Project Setup & Express Hello World](doc/lesson-1.md)
* [# 2 - GraphQL Hello World](doc/lesson-2.md)
* [# 3 - Add SQLite to GraphQL API](doc/lesson-3.md)
* [# 4 - Add Albums, Tracks and a Mutation](doc/lesson-4.md)

## Branches

To jump to the complete code for any lesson, switch to the corresponding branch:

* lesson1
* lesson2
* lesson3-start
* lesson3
* lesson4-step1
* lesson4-step2
* lesson4-step3

e.g.

```
git checkout lesson2 -f
```

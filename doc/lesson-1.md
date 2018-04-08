# Lesson # 1 - Project Setup & Express Hello World

In this lesson we will set up the project, ready to write typescript code and tests, running under NodeJS and ExpressJS.

## Step 1: Add packages

We will start off using the following packages:

#### Language & run-time:

*   typescript
*   ts-node
*   nodemon

#### Linting & formatting:

*   tslint
*   prettier
*   tslint-config-prettier
*   tslint-eslint-rules

```
npm install typescript ts-node nodemon tslint prettier tslint-config-prettier tslint-eslint-rules -D
```

## Step 2: Create a default `tsconfig.json`

```
.\node_modules\.bin\tsc --init
```

## Step 3: Create a default `.editorconfig`

Right-click in the root of the vs code file explorer tab and choose **Generate .editorconfig**

```
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = crlf
charset = utf-8
trim_trailing_whitespace = false
insert_final_newline = false
```

## Step 4: Create a `tslint.json`

*   Add our imported ruleset packages on top of 'latest' and add couple of rule overrides.
*   Turning off ordered imports is there to make things faster for the workshop.

```json
{
    "extends": ["tslint:latest", "tslint-eslint-rules", "tslint-config-prettier"],
    "rules": {
        "interface-name": false,
        "object-literal-sort-keys": false,
        "no-console": false,
        "ordered-imports": false
    }
}
```

## Step 5: Set up auto-format/fix options

1.  Create a `.prettierrc` file

```json
{
    "singleQuote": true,
    "printWidth": 120,
    "trailingComma": "all"
}
```

2.  In Workspace Settings (_File > Preferences > Settings_): add auto format & fix config

```json
"tslint.autoFixOnSave": true,
"editor.formatOnSave": true
```

## Step 6: Install ExpressJS server and types

```
npm install express -s
npm install @types/express -D
```

## Step 7: Add scripts to `package.json`

```json
"scripts": {
  "debug": "nodemon --inspect=9229 --ext ts,json,graphql --ignore ['**/*.spec.ts'] -r ts-node/register ./app.ts",
  "debug-brk": "nodemon --inspect-brk=9229 --ext ts,json,graphql --ignore ['**/*.spec.ts'] -r ts-node/register ./app.ts",
  "test": "node ./node_modules/mocha/bin/_mocha -r ts-node/register **/*.spec.ts",
  "murder-node": "taskkill /f /im node.exe"
},
```

## Step 8: Add VS Code launch configurations

Open or create a default `.vscode/launch.json` - e.g. from the debug tab drop-down choose _Add Configuration_.

*   **debug** launches the app with the debugger attached
*   **attach** allows you to debug an existing process
*   **debug current test** launches the currently open test file with mocha
*   **debug all tests** runs all test files with mocha

Replace the configurations section with these 4 entries:

```json
"configurations": [
    {
        "type": "node",
        "request": "launch",
        "name": "debug",
        "runtimeExecutable": "npm",
        "runtimeArgs": [
            "run-script",
            "debug-brk"
        ],
        "cwd": "${workspaceFolder}",
        "restart": true,
        "console": "integratedTerminal",
        "internalConsoleOptions": "openOnSessionStart",
        "port": 9229
    },
    {
        "type": "node",
        "request": "attach",
        "name": "attach",
        "port": 9229,
        "restart": true
    },
    {
        "name": "debug current test",
        "type": "node",
        "request": "launch",
        "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
        "args": [
            "-u", "tdd",
            "--nolazy",
            "--no-timeouts",
            "--colors",
            "-r", "ts-node/register",
            "${relativeFile}"],
        "cwd": "${workspaceRoot}",
        "protocol": "inspector",
        "console": "integratedTerminal",
        "internalConsoleOptions": "neverOpen"
    },
    {
        "name": "debug all tests",
        "type": "node",
        "request": "launch",
        "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
        "args": [
            "-u", "tdd",
            "--nolazy",
            "--no-timeouts",
            "--colors",
            "-r", "ts-node/register",
            "./**/*.spec.ts"],
        "cwd": "${workspaceRoot}",
        "protocol": "inspector",
        "console": "integratedTerminal",
        "internalConsoleOptions": "neverOpen"
    }
]
```

## Step 9: Create `app.ts`

Include the basic Hello World middleware function for the ExpressJS server to run.

```ts
import express from 'express';
const app = express();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(3000, () => console.log('Hello World running at http://localhost:3000'));
```

## Step 10: Run & debug

> Always running with the debugger attached can give peeps the sh1ts; as the interaction between the debugger and nodemon spawned processes isn't yet perfect, so choose A or B depending...

Run the app via A or B below:

### A) Run via the `debug` launch config

> From the VS Code debug tab, run the **debug** launch configuration.

> ✔ Experiment setting a breakpoint inside the middleware at `res.send('Hello World!');`

#### Notes the interaction between the debugger and nodemon

*   Nodemon will restart the process when `.ts`, `.json` or `.graphql` files are changed.
*   You must kill the terminal manually (rubbish bin icon or Ctrl+C etc) if you press stop on the debugger, as the nodemon process will keep running waiting for changed files. https://github.com/Microsoft/vscode/issues/19203
*   If the process is stopped or crashes, the debugger will wait for 10 seconds then timeout and prompt you to open the launch config. This can get annoying.
*   If your server won't start due to the listen port being in use, run `npm run murder-node` to kill off any orphaned `nodemon` spawned processes.

### B) Run via command line

> This is useful when you want to run without attaching the debugger.

```
npm run debug
```

#### To attach the debugger to running process

> From the VS Code debug tab, run the **attach** launch configuration.

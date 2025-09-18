# VSCode TS Debugger Launch

## 1) Find Node

```sh
which node
```

### Note

It will most likely look something like this: `/home/USERNAME/.nvm/versions/node/v22.14.0/bin/node`

## 2) Add Config

```json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch app.ts in Debug Mode - Terminal Enabled",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/app.ts"],
      "runtimeExecutable": "PATH TO NODE HERE",
      "console": "integratedTerminal"
    }
  ]
}
```

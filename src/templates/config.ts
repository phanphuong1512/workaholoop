export const configTemplate = (projectName: string) => JSON.stringify({
  "$schema": "https://wlp.dev/schema/v1/config.json",
  "version": "1.0.0",
  "project": {
    "name": projectName,
    "stack": [],
    "packageManager": "npm"
  },
  "verify": {
    "lint": "npm run lint",
    "test": "npm run test",
    "typecheck": "tsc --noEmit",
    "build": "npm run build"
  },
  "git": {
    "branchPrefix": "wlp/",
    "commitConvention": "conventional",
    "autoMerge": false
  },
  "github": {
    "syncEnabled": false,
    "labelPrefix": "wlp:",
    "createIssues": true
  },
  "worktree": {
    "enabled": false,
    "basePath": "../.wlp-worktrees",
    "portRange": [3001, 3099]
  }
}, null, 2);

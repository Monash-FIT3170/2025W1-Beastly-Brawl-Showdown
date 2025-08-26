# Project Structure & Config Flow
## Overview
```
root/
├── .config/
│   ├── tsconfig.base.json          # Shared compiler rules & paths
│   └── tsconfig.extension.json     # Extends base, no references
│
├── code/
│   └── simulator/
│       ├── core/                   # Core TypeScript project
│       │   └── tsconfig.json
│       └── data/                   # Data TypeScript project
│           └── tsconfig.json
│
└── extensions/
    ├── cli-tester/
    │   └── tsconfig.json           # Extends .config/tsconfig.extension.json, adds refs to core + data
    └── some-other-extension/
        └── tsconfig.json           # Extends same, but only references what it needs
```

## Config Chain
1. `tsconfig.base.json`
    - Compiler settings common across the repo — strict, target, moduleResolution, paths, etc.

2. `tsconfig.extension.json`
    - Extends `tsconfig.base.json`.
    - Sets composite: true for project references.
    - No "references" key — keeps it reusable.

3. Per‑extension `tsconfig.json`
    - Extends .config/tsconfig.extension.json.
    - Declares only its own dependencies via references using relative paths.

4. Core/Data `tsconfig.json`
    - Self‑contained projects with composite: true and their own includes.

## Why this works
- No more path confusion — each set of references is always relative to where it’s written.
- Avoids having to rewrite .config/tsconfig.extension.json if one extension needs different deps.
- Scales as you add more modules without breaking existing ones.
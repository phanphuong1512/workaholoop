```markdown
# workaholoop Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and workflows for the `workaholoop` TypeScript codebase. It covers file naming, import/export conventions, commit styles, and the main workflow for updating WLP agent skills. Use this guide to contribute code that aligns with the project's established practices.

## Coding Conventions

### File Naming
- **PascalCase** is used for file names.
  - Example:  
    ```
    MyComponent.ts
    TaskRunner.test.ts
    ```

### Import Style
- **Relative imports** are preferred.
  - Example:
    ```typescript
    import { doSomething } from './utils/Helper';
    ```

### Export Style
- **Named exports** are used instead of default exports.
  - Example:
    ```typescript
    // In TaskRunner.ts
    export function runTask() { ... }

    // In another file
    import { runTask } from './TaskRunner';
    ```

### Commit Patterns
- Commits are of mixed types, commonly prefixed with `feat`.
- Keep commit messages concise (average: ~31 characters).
  - Example:
    ```
    feat: add task scheduling logic
    ```

## Workflows

### wlp-skill-update-workflow
**Trigger:** When you need to update, refactor, or add WLP agent skills (e.g., for new features or architectural changes).  
**Command:** `/update-skill`

1. Edit one or more `.agents/skills/wlp-*/SKILL.md` files to document or update skill definitions.
2. Optionally, update related command files in `src/commands` or template files in `src/templates` as needed.
3. Commit your changes with a descriptive message, e.g.,  
   ```
   feat: update wlp-plan skill definition
   ```
4. Open a pull request for review.

**Files Involved:**
- `.agents/skills/wlp-auto/SKILL.md`
- `.agents/skills/wlp-close/SKILL.md`
- `.agents/skills/wlp-execute/SKILL.md`
- `.agents/skills/wlp-plan/SKILL.md`
- `.agents/skills/wlp-propose/SKILL.md`
- `.agents/skills/wlp-spec/SKILL.md`
- `.agents/skills/wlp-verify/SKILL.md`
- `.agents/skills/wlp-structure/SKILL.md`
- `.agents/skills/wlp-sync/SKILL.md`
- `.agents/skills/wlp-track/SKILL.md`

## Testing Patterns

- **Test files** follow the `*.test.*` pattern (e.g., `MyComponent.test.ts`).
- The testing framework is not explicitly specified; check existing test files for structure.
- Example test file:
  ```typescript
  // TaskRunner.test.ts
  import { runTask } from './TaskRunner';

  test('runTask executes correctly', () => {
    expect(runTask()).toBe(true);
  });
  ```

## Commands

| Command        | Purpose                                                      |
|----------------|-------------------------------------------------------------|
| /update-skill  | Start the WLP skill update workflow (see above for steps)   |
```

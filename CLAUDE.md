# harryAI Development Guide

## Commands

### Build & Run
- Dev server: `yarn dev` (localhost:3000)
- Build: `yarn build`
- Start (production): `yarn start`
- Generate static site: `yarn generate`

### Test
- Run all tests: `yarn test`
- Run single test: `jest test/path/to/test.spec.js`
- Run tests with filter: `yarn test -t "test description"`
- Lint: Add eslint with `yarn add -D eslint @nuxtjs/eslint-config-typescript`

## Code Style

### Structure
- Framework: Nuxt.js (Vue 2.7)
- TypeScript with strict mode enabled
- Module paths: Use `~/` or `@/` aliases for imports from project root

### Vue Components
- Use `.vue` single-file components
- Maintain consistent component structure (template, script, style)
- Use PascalCase for component names
- Keep components focused on a single responsibility

### TypeScript
- Prefer explicit typing over `any`
- Use async/await for asynchronous operations
- Follow Vue's typing conventions for components and props
- Use try/catch for proper error handling

### CSS
- Use Tailwind utility classes when possible
- Maintain consistent styling patterns

## Project Structure
- Components in `/components`
- Pages in `/pages` 
- Layouts in `/layouts`
- Store modules in `/store`

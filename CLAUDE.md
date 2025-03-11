# harryAI Development Guide

## Commands
- Build: `yarn build`
- Dev server: `yarn dev` (localhost:3000)
- Generate static: `yarn generate`
- Run all tests: `yarn test`
- Run single test: `jest test/path/to/test.spec.js`
- Lint: Add eslint with `yarn add -D eslint @nuxtjs/eslint-config-typescript`

## Code Style
- **TypeScript**: Use strict types; all new files should use TypeScript
- **Components**: Vue 2 composition API, Single File Components
- **Imports**: Import paths should use `@/` or `~/` aliases
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Error Handling**: Use try/catch for async operations
- **CSS**: Use Tailwind utility classes when possible
- **Testing**: Jest with Vue Test Utils for component testing

## Project Structure
- Components in `/components`
- Pages in `/pages` 
- Layouts in `/layouts`
- Store modules in `/store`
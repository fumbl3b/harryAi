# Commands

## Build & Run
- Dev server: `yarn dev`
- Build: `yarn build`
- Start (production): `yarn start`
- Generate static site: `yarn generate`

## Test
- Run all tests: `yarn test`
- Run single test: `yarn test path/to/file.spec.js`
- Run tests with filter: `yarn test -t "test description"`

# Code Style Guidelines

## Structure
- Framework: Nuxt.js (Vue 2.7)
- TypeScript with strict mode enabled
- Module paths: Use `~/` or `@/` aliases for imports from project root

## Vue Components
- Use `.vue` single-file components
- Maintain consistent component structure (template, script, style)
- Use PascalCase for component names
- Keep components focused on a single responsibility

## TypeScript
- Prefer explicit typing over `any`
- Use async/await for asynchronous operations
- Follow Vue's typing conventions for components and props
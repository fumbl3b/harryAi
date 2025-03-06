# harryAI - Chat with OpenAI

A simple chat interface for conversations with OpenAI's models.

## Setup

1. Install dependencies:
```bash
$ yarn install
```

2. Configure your OpenAI API key:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to the `.env` file
   - Optionally change the model (defaults to gpt-3.5-turbo)

3. Run the development server:
```bash
$ yarn dev
```

Note: This app uses a server middleware to securely make OpenAI API calls. The API key never leaves your server, making this approach more secure for deployment.

## Debugging OpenAI API

If you're having issues with OpenAI API responses:

1. Make sure your API key is correctly set in `.env`
2. Run the app in development mode with `yarn dev:reset`
3. Use the "Test API" button (visible in development mode) to verify your OpenAI connection
4. Check the server console for detailed logs
5. If needed, update the model in your `.env` file (e.g., `OPENAI_MODEL=gpt-4o`)

4. Build for production:
```bash
# build for production and launch server
$ yarn build
$ yarn start

# or generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).

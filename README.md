# krist.js

JavaScript and TypeScript wrapper for the [Krist API](https://krist.dev/docs).
Supports Node.js and the browser.

- [Guides and examples](https://docs.krist.dev/docs/libraries/krist-js.html)
- [Full API reference](https://docs.krist.dev/library/krist.js/modules/)

## Features
- Works on the server with Node.js, and in browsers
- ES Modules support
- Modern, Promise-based API with TypeScript support designed with async/wait in mind
- Type-safe functions for all HTTP endpoints
- Fully-featured WebSocket client with events and automatic reconnection
- Useful Promise exceptions for all API errors
- V2 Address generation with support for common wallet formats (KristWallet, Krist API, etc.)
- CommonMeta parser for transaction metadata
- Pagination helper for working with multiple pages of results
- Utilities for common tasks such as validating addresses and names

### Not yet supported
- Lookup API
- Search API
- Idempotent requests

## Quick Start

1. Install `krist` from npm or yarn:

```sh
npm install krist
yarn add krist
```

2. Import `krist` and create an instance of `KristApi`:

```ts
import { KristApi } from "krist";
const api = new KristApi();
```

More examples can be found at [docs.krist.dev](https://docs.krist.dev/docs/libraries/krist-js.html).
View the [full API reference here](https://docs.krist.dev/library/krist.js/modules/).

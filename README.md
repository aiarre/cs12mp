# cs12mp


## Getting Started
First, install the dependencies needed for the project. You may opt to
use other package managers such as pnpm or bun, but, in general, run:
```
npm install
```

### cs12242-mvu
Take note that this project uses a *vendored* version of 
[cs12242-mvu](https://github.com/UPD-CS12-242/cs12242-mvu) with two
key changes:
+ `MsgKeyUp` and `MsgMouseUp` events have been added
  ([bf63563](https://github.com/louie-github/cs12242-mvu/commit/bf63563b9c35bb8c8eaf06fdd55b305d1f7702e7))
+ `CanvasImage` loading has been fixed
  ([3fdfa05](https://github.com/louie-github/cs12242-mvu/commit/3fdfa05b7974a09ac5085d1d9884a9331e5324a0))

This fork of cs12242-mvu may be found [here](https://github.com/louie-github/cs12242-mvu).

## Running
To start the Vite server, run the command:
```bash
npm run serve
```

Alternatively, you can also run:
```bash
npx vite
```

By default, this will expose a development server on http://localhost:5173/.
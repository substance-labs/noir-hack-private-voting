# Relayer

The relayer in charge of sending the cast vote transactions.

## 📦 Installation

Ensure you have [Bun](https://bun.sh) installed:

```sh
curl -fsSL https://bun.sh/install | bash
```

Then, clone the repository and install dependencies:

```sh
git clone https://github.com/substance-labs/noir-hack-revelio
cd relayer
nvm use
bun install
```

## 🔧 Usage

Run the project with:

```sh
bun run src/index.ts
```

To start development mode with hot reloading:

```sh
bun dev
```

## 🛠️ Building

Compile TypeScript to JavaScript:

```sh
bun build src/index.ts --outdir=dist
```

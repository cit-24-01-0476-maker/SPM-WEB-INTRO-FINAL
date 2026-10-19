# SPM ECO — Project Website & Parking Prototype

Website and prototype work for the SPM ECO smart parking university team project.

## Technology

React, TypeScript, TanStack Start and Vite, with Firebase-backed administration. This repository uses TanStack Start; configure deployment to match the existing application.

## Run locally

```bash
git clone https://github.com/cit-24-01-0476-maker/SPM-WEB-INTRO-FINAL.git
cd SPM-WEB-INTRO-FINAL
npm ci
```

Copy `.env.example` to `.env` and follow [SETUP.md](SETUP.md) for configuration.

```bash
npm run dev
```

Use the local address printed by Vite.

## Documentation

- [Firebase administration and deployment setup](SETUP.md)
- [Parking prototype](PARKING-PROTOTYPE.md)
- [Repository integration instructions](AGENTS.md)

## Checks

```bash
npm run build
npm run lint
npm run typecheck
npm run test:parking
```

## Contributing

Keep changes focused and describe how they were verified. Never commit credentials or local environment files.

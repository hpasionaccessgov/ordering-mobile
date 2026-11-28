# Cafébara mobile

Ionic React + TypeScript app for Cafébara customers. Talks to the same backend as the web app; no
business rules are duplicated here.

- Agent rules: `AGENTS.md`
- Conventions: `docs/CODEBASE_CONVENTIONS.md`
- Backend contract used by this app: `docs/API.md`
- Feature map: `features/README.md` (index), `features/_guide.md` (format)

## Run

```bash
npm install
npm run dev                 # Vite dev server
npm run lint                # eslint + e2e typecheck + prettier check
npm run test:unit           # vitest
npm run build               # tsc + vite build -> dist/
```

Set `VITE_API_BASE_URL` to point at another backend (default: `http://localhost:8080/api` on web,
`http://10.0.2.2:8080/api` in the Android emulator).

## Android

```bash
npx cap sync android
cd android && ./gradlew.bat :app:assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`. Capacitor 8 needs JDK 21; the project
pins Android Studio's JBR in `android/gradle.properties`.

`cafebara/` is a separate repository and is intentionally untouched by this project's tooling.

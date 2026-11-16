# Constructor · T-20261114-001 · ronda 1 (claude opus)

Proyecto Vite + TypeScript vanilla inicializado en el worktree. 8/8 pruebas rojo→verde; 4 puertas en ok.
Commit `9d03f0e` en `fabrica/T-20261114-001`. Sin merge/push; no se tocó `app/`.

## Archivos cambiados
- `package.json` — `type: module`, `private`, sin `dependencies`; scripts dev/lint/typecheck/test/build/preview.
  devDependencies: vite 7.3.8, vitest 3.2.7, typescript 5.9.3, jsdom 31.0.1, eslint 9.39.5, @eslint/js 9.39.5,
  typescript-eslint 8.72.2, globals 17.14.0, @types/node 24.19.2.
- `package-lock.json`
- `tsconfig.json` — strict, ES2022, moduleResolution bundler, noEmit, types vite/client + node.
- `vite.config.ts` — `defineConfig` de `vitest/config` con `test.environment: "jsdom"`.
- `eslint.config.js` — flat config con @eslint/js y typescript-eslint recomendados.
- `index.html` — mínimo: `lang="es"`, charset, viewport, `<title>Cafetería Luna</title>`, script módulo `/src/main.ts`.
- `src/main.ts` — importa `./styles/tokens.css` y luego `./styles/main.css`.
- `src/styles/tokens.css`, `src/styles/main.css` — solo un comentario.
- `src/project.test.ts` — pruebas CA-1..CA-7.
- `README.md` — sección "Cómo ejecutar".

## CA → prueba (rojo → verde)
| CA | Prueba | Rojo | Verde tras |
|---|---|---|---|
| CA-1 | `CA-1: package.json scripts` | falta "dev" | añadir los 6 scripts |
| CA-2 | `CA-2: dependencies` (2 tests) | falta vite/eslint; lock apartado | instalar devDependencies; restaurar lock |
| CA-3 | `CA-3: index.html head` | DOMParser no definido / sin index.html | jsdom + index.html |
| CA-4 | `CA-4: no section content yet` | igual que CA-3 | index.html |
| CA-5 | `CA-5: base source files` | sin src/main.ts | crear main.ts y CSS |
| CA-6 | `CA-6: imports in order` | main.ts vacío | imports en orden |
| CA-7 | `CA-7: smoke test in jsdom` | window undefined | environment jsdom |
| CA-8 | `node scripts/verificar.mjs …` | puertas omitidas | 4 ok, exit 0 |
| CA-9 | inspección `dist/index.html` | no existía | lang="es" y título correcto |

## Puertas
lint ok · typecheck ok · test ok (8/8) · build ok · exit 0.

## Decisiones nuevas
Ninguna que contradiga el brain. Versiones fijadas: vite 7 + vitest 3 + typescript 5 (compatibilidad typescript-eslint 8).

## Observaciones
- npm avisa de que eslint 9.39.5 ya no tiene soporte; se mantiene por D-03 (pasar a ESLint 10 sería decisión humana).
- npm 12 bloqueó el postinstall de esbuild (allowScripts); el build funciona con el binario opcional de plataforma.
- Riesgo ALTO esperado: toca dependencias, configuración de build, index.html y src/main.ts.

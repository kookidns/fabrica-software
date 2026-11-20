# AI Factory — Constitución

Esta carpeta es una **fábrica de software con agentes**: entra trabajo por un lado (una tarea, un
error de producción, una issue) y sale código integrado por el otro. En medio hay estaciones que
no necesitan al humano, pero el humano diseñó el sistema y decide en los puntos críticos.

Una factory solo funciona si cumple dos condiciones:
1. **Repetible**: la misma clase de tarea sigue siempre el mismo camino.
2. **Auditable**: cada estación deja rastro (`tareas/<ID>/`), así se ve dónde falló algo.

## Tres tipos de estación
| Tipo | Cuándo | Ejemplos aquí |
|---|---|---|
| **Código** (determinista) | Lo que siempre se hace igual | `scripts/*.mjs`: crear tarea, puertas, riesgo, cierre |
| **Agente** (razona) | Depende de la entrada | spec-writer, constructor, revisores, aprobador |
| **Humano** | Lo crítico | aprobar la spec y la **estructura y recursos visuales** de un proyecto nuevo, aprobar cambios de riesgo alto |

## Estructura
| Ruta | Qué es |
|---|---|
| `estandares/` | Reglas comunes a TODOS los proyectos. |
| `plantillas/proyecto/` | Esqueleto de un proyecto nuevo. |
| `proyectos/<p>/brain/` | **El brain**: memoria persistente del proyecto. Fuente de verdad. |
| `proyectos/<p>/bandeja/` | Entradas pendientes (un `.md` por tarea/error/issue). |
| `proyectos/<p>/tareas/<ID>/` | Rastro de auditoría de cada tarea: entrada, spec, revisiones, aprobación, riesgo, traza. |
| `proyectos/<p>/app/` | El código (repositorio git propio, rama `main`). |
| `proyectos/<p>/.worktrees/<ID>/` | Copia de trabajo aislada de cada tarea (rama `fabrica/<ID>`). Permite tareas en paralelo. |

## El brain: la regla de oro
Si la fábrica olvida el contexto, cada tarea empieza de cero y el agente acaba decidiendo cosas
que ya estaban decididas (otra base de datos, otro estilo, código duplicado).
- **Antes de especificar o programar**, lee `brain/index.md` y lo que indique.
- **Toda decisión nueva** se registra en `brain/decisiones.md`. Lo que no está en el brain no existe.
- Nunca contradigas el brain en silencio. Si una tarea lo exige, dilo y pide decisión humana.

## Antes de construir: estructura y recursos visuales (`/nuevo-proyecto` y `/estructura`)
ChatGPT (vía Codex) NO dibuja la página terminada: a partir del brain define la **estructura como
diagrama** (`diagrama.md`, en Mermaid: páginas, navegación, secciones y componentes) y genera **solo las
imágenes que irán dentro** (ilustraciones, fotos, fondos), optimizadas a WebP (`scripts/estructura.mjs`).
Los iconos simples los dibuja el constructor en SVG. El humano pide cambios o lo aprueba; **solo el
humano** ejecuta `node scripts/estructura.mjs aprobar <p>`. Lo aprobado vive en `brain/estructura/aprobado/`
y es el objetivo: el arquitecto, el diseñador, el spec-writer, el constructor y el revisor de UI trabajan con
ese diagrama y esos recursos. Sin él, `nueva-tarea.mjs` no deja empezar
(`fabrica.config.json > estructura.obligatorio`).

## La línea de producción (`/fabrica <p>`)
```
estructura aprobada ─► entrada ─► [estructura de la tarea, solo si es una pantalla nueva] ─► [spec-writer] ─► [constructor: TDD en su worktree] ─► puertas
        ─► 4 revisores en paralelo, contexto limpio: seguridad · UX · UI · código
        ─► [aprobador] ─ rechazado ─► vuelve al constructor (máx. 3 rondas)
        ─► riesgo: script + [clasificador-riesgo] ─► BAJO: se integra solo en main
                                                  └► ALTO: espera aprobación humana
```

## Dos motores
Cada estación corre en **Claude** (subagente) o en **Codex** (OpenAI, vía `scripts/agente-codex.mjs`)
según `fabrica.config.json`. Los dos usan las mismas definiciones de rol (`.claude/agents/`), el mismo
brain y las mismas reglas (`AGENTS.md` apunta a este archivo).

## Reglas para todos los agentes
- Trabaja solo en el proyecto indicado; el código, solo en su worktree.
- Quien valida no es quien generó: los revisores y el aprobador nunca editan código.
- Nadie se salta las puertas (`node scripts/verificar.mjs <carpeta>`) ni desactiva tests o reglas para pasarlas.
- Los agentes **no** integran en `main` ni hacen push: eso lo hace `scripts/cerrar-tarea.mjs`, y
  solo el humano puede ejecutar `--aprobar`. Un hook (`.claude/hooks/guardian.mjs`) lo impone.

# Brain — índice

Memoria persistente del proyecto. Cualquier agente lee este archivo antes de actuar.

| Archivo | Contiene | Léelo cuando… |
|---|---|---|
| `vision.md` | Problema, público, objetivo, marca y tono | siempre que haya texto o UX de por medio |
| `spec.md` | Alcance global y criterios del producto | escribas una spec de tarea |
| `estructura/aprobado/` | **El objetivo** aprobado por el humano: `diagrama.md` (estructura) y `recursos.json` + `img/*.webp` (imágenes de la página) | toques interfaz, diseñes, planifiques o escribas una spec |
| `boceto/aprobado-*.png` | Boceto de página completa (sistema anterior, histórico; manda la estructura si existe) | quieras ver el origen de D-13/D-14 |
| `arquitectura.md` | Stack, estructura, datos, integraciones | vayas a tocar código |
| `diseno.md` | Tokens visuales y componentes base | toques interfaz |
| `decisiones.md` | Decisiones tomadas y por qué (no se rediscuten) | siempre |
| `huecos.md` | Lo que el brain todavía NO sabe | te falte información |
| `log.md` | Historial de tareas cerradas | quieras saber qué se hizo |

## Cómo se mantiene
- Decisión nueva → entrada en `decisiones.md` (con fecha y tarea que la originó).
- Duda que nadie resolvió → `huecos.md`. No inventes la respuesta.
- Tarea cerrada → entrada en `log.md`.

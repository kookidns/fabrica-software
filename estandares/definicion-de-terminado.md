# Definición de terminado

Una tarea está **terminada** solo si se cumple TODO esto:

1. [ ] Cumple cada criterio de aceptación de `tareas/<ID>/spec.md`.
2. [ ] Se hizo con TDD: cada criterio tiene una prueba que falló antes del código y pasa después.
3. [ ] `node scripts/verificar.mjs <carpeta de trabajo>` termina sin errores (lint, typecheck, test, build).
4. [ ] Respeta el brain (`arquitectura.md`, `diseno.md`, `decisiones.md`) y `estandares/`.
5. [ ] Los cuatro revisores (seguridad, UX, UI, código) emitieron informe y el **aprobador** dijo APROBADO.
6. [ ] El nivel de riesgo está calculado y, si es ALTO, un humano lo aprobó.
7. [ ] `brain/log.md` y, si hubo decisiones nuevas, `brain/decisiones.md` están actualizados.

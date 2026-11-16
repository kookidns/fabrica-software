# Huecos de conocimiento

Preguntas que el brain aún no sabe responder. Un humano las resuelve y la respuesta pasa al archivo que corresponda.

## Contenido de negocio (bloquea la publicación)
- [ ] (2026-11-14 · analista) ¿Cuál es el eslogan de Cafetería Luna? → `vision.md`, HU-01
- [ ] (2026-11-14 · analista) ¿Qué bebidas y postres van en el menú y con qué precio exacto? → HU-02
- [ ] (2026-11-14 · analista) ¿En qué moneda y formato se muestran los precios (país/ciudad)? → HU-02
- [ ] (2026-11-14 · analista) ¿Cuál es el horario por día de la semana y qué días cierra? ¿Hay horarios especiales en festivos? → HU-03
- [ ] (2026-11-14 · analista) ¿Cuál es la dirección completa de la cafetería? → HU-03
- [ ] (2026-11-14 · analista) ¿Cuál es el número de WhatsApp (con prefijo internacional) para reservas? → HU-04
- [ ] (2026-11-14 · analista) ¿Qué texto pre-rellenado debe llevar el mensaje de reserva? → HU-04
- [ ] (2026-11-14 · arquitecto) ¿Cuáles son las coordenadas exactas (lat/lng) del local para el mapa y "Cómo llegar"? → `src/data/business.ts`, HU-03

## Marca y diseño
- [ ] (2026-11-14 · analista) ¿Existe logo, paleta de colores o tipografía de marca? → `vision.md`, `diseno.md`
- [ ] (2026-11-14 · analista) ¿Hay fotos propias (local, café, postres) o se usan recursos de stock / sin fotos? → `diseno.md`
- [ ] (2026-11-14 · analista) ¿Hay webs de referencia que gusten o no gusten? → `vision.md`
- [ ] (2026-11-15 · spec-writer, T-20261115-004) A 768 px o más, el marcador del mapa de OSM queda algo por debajo del centro, cerca de la barra de atribución, porque el bbox cuadrado de D-10 (d = 0.005° en lat y lng) se encaja en un iframe 16:9. ¿Se ajusta el bbox (p. ej., un `d` de latitud mayor que el de longitud), lo que cambia D-10 y `src/lib/maps.ts` (zona sensible), o se acepta tal cual? → `decisiones.md` (D-10)
- [ ] (2026-11-15 · spec-writer, T-20261115-001) ¿Se aprueba cargar Fraunces y DM Sans desde Google Fonts (recurso de terceros: envía la IP del visitante a Google y añade peticiones externas), o se autoalojan los archivos de fuente, o se usan solo las fuentes del sistema (fallbacks de los tokens)? → `diseno.md`, `decisiones.md`

## Producto y alcance
- [ ] (2026-11-14 · analista) ¿Confirmar rango de edad del público (supuesto 18–35)? → `vision.md`
- [ ] (2026-11-14 · analista) ¿Cómo se medirá el éxito (p. ej., reservas por WhatsApp al mes)? ¿Se quiere analítica de visitas/clics? → `vision.md`
- [ ] (2026-11-14 · analista) ¿Se muestran enlaces a redes sociales (Instagram, etc.) en el pie? → `spec.md`
- [ ] (2026-11-14 · analista) ¿Se deben indicar alérgenos u opciones (vegano, sin gluten, leches vegetales) en el menú? → HU-02
- [ ] (2026-11-14 · analista) ¿Quién actualizará menú y precios y con qué frecuencia? (hoy fuera de alcance un panel de edición) → `spec.md`
- [ ] (2026-11-14 · analista) ¿Hay dominio propio donde se publicará? → `arquitectura.md`
- [ ] (2026-11-15 · spec-writer, T-20261115-004) Los controles internos del mapa de OpenStreetMap (zoom +/− y enlaces de atribución, unos 30 px) incumplen CA-05.2 (44×44 px) y no se pueden estilar porque viven en un iframe de otro origen. La acción táctil equivalente es "Cómo llegar" (48 px). ¿Se acepta como excepción permanente de CA-05.2, o se prefiere otra solución (otro proveedor, mapa estático, fachada "clic para cargar", quitar el mapa interactivo) que cambiaría D-05 y D-10? → `brain/spec.md` (CA-05.2), `diseno.md`, `decisiones.md`
- [ ] (2026-11-15 · spec-writer, T-20261115-005) La entrada de bandeja 007 (anillo de foco de la marca) dice `cubre: CA-05.4`, pero ese CA trata de lectores de pantalla y ningún CA de `brain/spec.md` exige foco visible por teclado. ¿Se añade un CA de producto (p. ej., CA-05.5: "todo elemento enfocable muestra un anillo de foco completo, sin recortar, a 375, 768 y 1024 px") para que las tareas de foco tengan a qué apuntar? → `brain/spec.md` (HU-05)

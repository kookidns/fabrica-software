# Estilo de código

- Nombres de código en inglés; textos visibles para el usuario en el idioma del proyecto (ver spec).
- Componentes pequeños: si un archivo pasa de ~200 líneas, divídelo.
- Un componente por archivo, en `PascalCase.tsx`. Utilidades en `camelCase.ts`.
- Nada de colores, tamaños ni espaciados "a mano": usa los tokens de `brain/diseno.md`.
- Accesibilidad básica siempre: HTML semántico, `alt` en imágenes, contraste AA, navegable con teclado.
- Responsive desde móvil (375 px) hacia arriba.
- Sin secretos en el código: variables en `.env` y un `.env.example` versionado.
- Comentarios solo para explicar el *por qué*, no el *qué*.

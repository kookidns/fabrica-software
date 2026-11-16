<!-- tipo: tarea · origen: bandeja/004-seccion-menu.md · 2026-11-15T02:54:12.479Z -->

---
tipo: tarea
cubre: CA-02.1, CA-02.2, CA-02.3, CA-02.4
---
# Sección Menú con bebidas y postres
Crear `src/lib/formatPrice.ts` (`Intl.NumberFormat` con `locale`/`currency` de `business.ts`, D-06)
y `src/sections/menu.ts`, que pinta dos grupos titulados "Bebidas" y "Postres" con cada producto
como nombre + precio en la misma fila (lista de definición o lista semántica). Layout mobile-first
sin scroll horizontal a 375 px; nombres largos pasan a la línea siguiente sin separarse de su precio.
Pruebas: dos grupos con sus títulos, cada producto de `business.ts` aparece con su precio formateado
y el número de productos pintados coincide con el de los datos (CA-02.4 queda pendiente de la carta
real, ver `huecos.md`).

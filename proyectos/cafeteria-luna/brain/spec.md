# Especificación del producto

Estado: APROBADA (2026-11-14, demo de prueba)

## Alcance
### Entra
- Una única página (landing) en español, pensada primero para móvil.
- Portada con nombre y eslogan de la cafetería.
- Menú con dos categorías: bebidas y postres, cada producto con nombre y precio.
- Sección de horario y ubicación con dirección y mapa.
- Botón para reservar mesa que abre una conversación de WhatsApp con la cafetería.
- Navegación interna entre secciones de la misma página.

### No entra
- Pedidos o pagos en línea, carrito, delivery.
- Sistema de reservas propio (calendario, disponibilidad, confirmaciones automáticas).
- Registro de usuarios, cuentas o área privada.
- Panel de administración para editar menú/horario (el contenido se cambia en el código).
- Otros idiomas, blog, galería extensa, programa de fidelización.

## Páginas / pantallas
| Página | Propósito | Contenido principal |
|---|---|---|
| Landing (única) | Informar y convertir en reserva | Secciones: Portada · Menú · Horario y ubicación · Reservar (botón WhatsApp) · Pie |

## Historias de usuario y criterios de aceptación

### HU-01 · Reconocer la cafetería al entrar
Como vecino joven que entra desde el móvil quiero ver de inmediato el nombre y el eslogan para
saber que estoy en la web correcta y qué transmite el lugar.

- **CA-01.1** — Dado que abro la página en un móvil de 375 px de ancho, cuando carga, entonces
  veo el nombre "Cafetería Luna" y el eslogan sin hacer scroll.
- **CA-01.2** — Dado que estoy en la portada, cuando la miro sin hacer scroll, entonces hay un
  botón visible de "Reservar mesa" (ver HU-04).
- **CA-01.3** — Dado cualquier punto de la página, cuando uso la navegación, entonces puedo ir
  directamente a las secciones Menú, Horario y ubicación, y Reservar.

### HU-02 · Consultar el menú con precios
Como cliente potencial quiero ver las bebidas y los postres con su precio para decidir qué tomar
y cuánto me costará antes de ir.

- **CA-02.1** — Dado que estoy en la sección Menú, cuando la recorro, entonces veo dos grupos
  separados y titulados: "Bebidas" y "Postres".
- **CA-02.2** — Dado cualquier producto del menú, cuando lo leo, entonces muestra nombre y precio
  con el símbolo de la moneda local [PENDIENTE moneda].
- **CA-02.3** — Dado un móvil de 375 px, cuando veo el menú, entonces no hay scroll horizontal y
  cada nombre aparece en la misma línea visual que su precio o justo encima/debajo, sin ambigüedad.
- **CA-02.4** — Dado el contenido del menú, cuando se compara con la carta facilitada por el
  negocio [PENDIENTE], entonces todos los productos y precios coinciden exactamente.

### HU-03 · Saber cuándo abre y dónde está
Como vecino quiero ver el horario y la ubicación en un mapa para saber si está abierto y cómo
llegar.

- **CA-03.1** — Dado que estoy en la sección Horario y ubicación, cuando la leo, entonces veo el
  horario de cada día de la semana, incluidos los días de cierre [PENDIENTE horario].
- **CA-03.2** — Dado la misma sección, cuando la leo, entonces veo la dirección completa en
  texto [PENDIENTE dirección].
- **CA-03.3** — Dado la misma sección, cuando cargo la página, entonces se muestra un mapa con
  la ubicación de la cafetería marcada.
- **CA-03.4** — Dado que pulso "Cómo llegar" (o el mapa) desde el móvil, cuando se procesa,
  entonces se abre la ubicación en la app o web de mapas del dispositivo.

### HU-04 · Reservar mesa por WhatsApp
Como cliente quiero reservar mesa con un toque por WhatsApp para no tener que llamar ni rellenar
formularios.

- **CA-04.1** — Dado que estoy en cualquier sección, cuando busco cómo reservar, entonces hay un
  botón "Reservar mesa por WhatsApp" accesible (en la portada y en la sección Reservar como
  mínimo).
- **CA-04.2** — Dado que pulso el botón en un móvil con WhatsApp, cuando se procesa, entonces se
  abre un chat con el número de la cafetería [PENDIENTE número].
- **CA-04.3** — Dado que se abre el chat, cuando lo veo, entonces el mensaje viene
  pre-rellenado con un texto de reserva que pide fecha, hora y nº de personas [PENDIENTE texto
  exacto].
- **CA-04.4** — Dado que pulso el botón en un ordenador sin la app, cuando se procesa, entonces
  se abre WhatsApp Web (o la página de WhatsApp) con el mismo número y mensaje.

### HU-05 · Usar la página cómodamente desde el móvil
Como usuario móvil quiero que la página cargue rápido y se lea bien para encontrar lo que busco
sin esfuerzo.

- **CA-05.1** — Dado un móvil de 375 px, cuando recorro toda la página, entonces no hay scroll
  horizontal ni texto cortado.
- **CA-05.2** — Dado cualquier botón o enlace, cuando lo mido, entonces su zona táctil es de al
  menos 44×44 px.
- **CA-05.3** — Dado una auditoría Lighthouse en modo móvil, cuando se ejecuta, entonces
  rendimiento ≥ 90 y accesibilidad ≥ 90.
- **CA-05.4** — Dado un lector de pantalla, cuando recorre la página, entonces cada sección tiene
  un encabezado, las imágenes informativas tienen texto alternativo y el botón de WhatsApp
  anuncia su propósito.

## Requisitos no funcionales
- Responsive desde 375 px; diseño mobile-first.
- Accesibilidad WCAG AA (contraste, foco visible, navegación por teclado).
- Lighthouse rendimiento ≥ 90 en móvil.
- Todo el texto en español.
- No se recogen datos personales en la web (la reserva ocurre en WhatsApp).

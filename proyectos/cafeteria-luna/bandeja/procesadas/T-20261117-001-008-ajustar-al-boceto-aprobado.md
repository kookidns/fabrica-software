---
tipo: tarea
cubre: CA-05.1, CA-05.4
---
# Ajustar la página al boceto aprobado
La página se construyó antes de que existiera el boceto del proyecto (brain/boceto/aprobado-movil.png y
aprobado-escritorio.png, aprobado.md). Hay que acercarla a ese objetivo visual sin cambiar contenido ni datos:
- luna junto al nombre en la cabecera y luna decorativa en la portada; en escritorio, ilustración de una taza junto al título;
- iconos de taza y pastel en las tarjetas del menú y líneas de puntos entre producto y precio;
- encabezados de sección con líneas decorativas a los lados;
- iconos de calendario y ubicación en horario y dirección;
- logo de WhatsApp en los botones de reserva;
- pie oscuro con la luna.
Los gráficos van como SVG ligeros y decorativos (aria-hidden), hechos en el código, nunca copiando las imágenes del
boceto. Los textos y datos reales mandan sobre los de ejemplo del boceto. Mantener accesibilidad (contraste AA,
foco visible, 44 px) y Lighthouse móvil ≥ 90.

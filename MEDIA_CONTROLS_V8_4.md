# V8.4 — Media controls

Esta actualización es retrocompatible con el contenido ya guardado en Supabase. No requiere ejecutar un schema.sql nuevo ni resetear la base.

## Nuevos controles
- Fit: cubrir todo / mostrar completo.
- Posición horizontal y vertical del foco.
- Zoom.
- Proporción del marco cuando el componente lo permite.
- Autoplay, mute, loop y controles para video.
- YouTube: inicio y fin en segundos, subtítulos, modo limpio.
- El selector de YouTube detecta `t=` / `start=` del enlace y guarda el timestamp.

## Modo limpio de YouTube
Reduce la interfaz visible usando embed `youtube-nocookie`, sin controles y sin interacción del puntero. YouTube no ofrece una API que garantice eliminar toda su marca/título en todos los estados del reproductor; para control visual total conviene usar MP4/WebM propio desde Supabase Storage.

## Persistencia
Los cambios previos hechos desde el CMS siguen en Supabase. Esta versión carga el JSON existente y solo añade nuevas propiedades cuando se usan los nuevos controles.

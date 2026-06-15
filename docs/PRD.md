# PRD: Battle Git

## 1. Vision General del Producto

Battle Git es un juego web interactivo donde desarrolladores conectan su cuenta de GitHub para transformar su actividad real en personajes, stats y batallas estilo RPG.

El juego busca convertir habitos de desarrollo saludables en progreso jugable: constancia, colaboracion, calidad de codigo, revisiones, tests y participacion en proyectos. La fantasia central es simple: tu historial de GitHub alimenta a tu personaje, pero ganar no depende solo de commitear mas.

## 2. Objetivos Estrategicos

- Gamificar el desarrollo para motivar consistencia, buenas practicas y colaboracion.
- Crear una experiencia competitiva sana entre desarrolladores.
- Hacer visible el progreso tecnico de una forma entretenida y compartible.
- Evitar incentivos negativos, como commits vacios, spam de PRs o actividad artificial.

## 3. Publico Objetivo

- Desarrolladores junior que quieren construir habitos y portafolio.
- Desarrolladores intermedios que disfrutan competir, medirse y compartir progreso.
- Comunidades, bootcamps y equipos que buscan dinamicas livianas de motivacion.
- Creadores de contenido tecnico que quieran mostrar actividad dev de forma ludica.

## 4. Propuesta de Valor

Battle Git convierte senales tecnicas reales en una identidad jugable. En vez de mostrar solo graficos de contribuciones, el producto traduce actividad, calidad y colaboracion en un avatar, habilidades, logros, batallas y rankings.

La experiencia debe sentirse como un RPG compacto, social y tecnico: facil de entrar, divertido de mirar y lo bastante justo como para que no gane automaticamente quien tiene mas tiempo libre.

## 5. Principios de Producto

- Calidad sobre cantidad: los commits importan, pero no deben ser el unico factor.
- Transparencia: el usuario debe entender por que tiene esos stats.
- Privacidad primero: el usuario controla que datos se leen y que se muestran.
- Juego justo: normalizar actividad para evitar ventajas desmedidas por repos grandes, bots o monorepos.
- Feedback inmediato: cada sincronizacion debe mostrar cambios visibles en personaje, stats o progreso.
- Espectaculo liviano: las batallas deben sentirse visualmente potentes, con escenarios, personajes y animaciones 3D, pero sin volver complejo el MVP.

## 6. Features Principales

### 6.1 Autenticacion y Perfil

#### OAuth con GitHub

El usuario inicia sesion conectando su cuenta de GitHub mediante OAuth.

Permisos sugeridos para MVP:

- Leer perfil publico.
- Leer repositorios publicos.
- No solicitar repositorios privados en el MVP.

Decision actual:

- El MVP usa solo repositorios publicos.
- Los repos publicos representan parte del "poder" o "ejercito" de cada desarrollador.
- El acceso a repos privados puede evaluarse a futuro como opt-in avanzado.

#### Sincronizacion de Datos

El sistema consume datos de GitHub para calcular actividad y calidad.

Datos candidatos:

- Commits recientes.
- Pull requests creados y mergeados.
- Reviews realizadas.
- Issues cerradas.
- Lenguajes principales.
- Repositorios activos.
- Tests o CI cuando sea detectable.

Mejora funcional recomendada:

- Mostrar una pantalla de "Datos usados para tus stats" para aumentar confianza.
- Permitir excluir repositorios del calculo.
- Separar sincronizacion manual y sincronizacion automatica programada.

#### Generacion de Avatar

El personaje se genera a partir de senales del perfil.

Ejemplos:

- JavaScript / TypeScript: hechicero de eventos.
- Python: caballero estratega.
- Go: guardian concurrente.
- Rust: paladin de memoria.
- Java: arquitecto de fortalezas.
- CSS / frontend dominante: ilusionista visual.

Mejora UX recomendada:

- Permitir elegir entre 2 o 3 variantes de avatar generadas por el sistema.
- Desbloquear cosmeticos por logros, no por volumen bruto de commits.

#### Ejercito de Repositorios

Cada repositorio publico puede representarse como un personaje dentro del campo de batalla.

Reglas iniciales:

- El nombre del personaje es el nombre del repositorio.
- El lenguaje principal define el tipo de personaje visual.
- El poder del personaje se calcula proporcionalmente a commits, forks e issues.
- Si el repositorio es un fork, se representa como un esbirro.
- Si el repositorio es source, se representa como una clase principal como mago, caballero, arquero, guardian, paladin o explorador.
- El MVP debe mostrar estos personajes en un campo de batalla Three.js explorable con zoom y movimiento por teclado.
- El army se consulta siempre desde snapshots persistidos en Neon para evitar llamadas repetidas a GitHub.
- El usuario puede solicitar un nuevo sync contra GitHub una vez por dia; cada intento queda registrado en `sync_runs`.
- Al hacer hover sobre un personaje o esbirro, la UI debe mostrar nombre del repo, origen Fork/Source y poder numerico.

### 6.2 Sistema de Stats

Los stats deben ser comprensibles, balanceados y resistentes al abuso.

#### HP

Basado en consistencia reciente.

Senales posibles:

- Dias activos en los ultimos 30 dias.
- Rachas de contribucion.
- Ritmo estable sin picos sospechosos.

Mejora recomendada:

- Usar una curva de rendimiento decreciente para que una racha enorme no rompa el balance.

#### Ataque

Basado en impacto reciente.

Senales posibles:

- Commits validos del ultimo mes.
- PRs mergeados.
- Issues cerradas.
- Participacion en repos con actividad real.

Mejora recomendada:

- Ponderar mas PRs mergeados y contribuciones revisadas que commits directos aislados.

#### Defensa

Basada en calidad y mantenibilidad.

Senales posibles:

- PRs aprobados.
- Baja proporcion de issues reabiertas.
- Presencia de tests o CI.
- Repos con README, licencia y estructura mantenible.

Mejora recomendada:

- Evitar prometer "calidad de codigo" profunda en MVP si no se analizara codigo realmente.
- Llamarlo inicialmente "Guardia" o "Disciplina" si se basa en metadatos de GitHub.

#### Velocidad

Stat adicional recomendado.

Senales posibles:

- Tiempo promedio entre apertura y resolucion de PRs/issues.
- Frecuencia de respuesta en reviews.
- Actividad reciente balanceada.

#### Especial

Habilidad unica derivada del perfil.

Ejemplos:

- "Refactor Arcano": reduce ataque enemigo si el usuario tiene muchas mejoras en PRs.
- "CI Shield": bloquea parte del dano si sus repos tienen workflows activos.
- "Night Deploy": bonus menor por actividad nocturna, limitado para no incentivar malos habitos.

### 6.3 Sistema de Batalla

#### Modo Arena PvP

El usuario busca un oponente y se simula una batalla por turnos usando stats calculados.

Decision de MVP:

- Las batallas son simuladas.
- El usuario puede ver la animacion completa o usar un boton "Skip" para saltar al resultado.
- En una version futura se podrian agregar acciones elegidas por el usuario, pero no forma parte del primer alcance.

Mejoras recomendadas:

- Mostrar una previa de matchup: ventaja, riesgo y rareza del rival.
- Explicar cada turno con mensajes vinculados a stats reales.
- Evitar batallas totalmente deterministas agregando variacion controlada.
- Guardar historial de batallas para revisar progreso.

Decision de MVP:

- La arena incluye usuarios registrados y bots starter claramente identificados como `BOT`.
- Los primeros bots deben estar por debajo o al nivel del poder actual del usuario.
- Los bots siguientes deben superar por poco al usuario para incentivar nuevos commits, repositorios y syncs.
- La pantalla `/game/arena/battle` reproduce una batalla visual basada en el sistema de la demo.

#### Modo Raid Cooperativo

Varios usuarios combinan stats para enfrentar un boss.

Alcance:

- Queda fuera del MVP.
- A futuro puede incluir equipos, requerimientos de ingreso y representacion por paises.

Ejemplos de bosses:

- The Legacy Code Monster.
- Merge Conflict Hydra.
- Dependency Dragon.
- Flaky Test Phantom.

Mejoras recomendadas:

- Bosses semanales con reglas especiales.
- Roles de equipo: tanque, soporte, dano, estratega.
- Recompensas cosmeticas compartidas.

#### Modo Entrenamiento

Feature recomendada para MVP o post-MVP temprano.

Permite probar al personaje contra enemigos de practica sin afectar ranking.

Valor UX:

- Reduce ansiedad antes del PvP.
- Ayuda a entender stats.
- Permite mostrar el sistema de batalla desde la primera sesion.

### 6.4 Matchmaking y Rankings

#### Matchmaking

El sistema empareja usuarios con poder relativo similar.

Factores:

- Nivel de personaje.
- Poder total normalizado.
- Actividad reciente.
- Historial de victorias/derrotas.

Mejora recomendada:

- Usar ligas o divisiones para que el ranking global no sea frustrante.

#### Rankings

Rankings posibles:

- Global.
- Semanal.
- Por lenguaje principal.
- Por region o comunidad.
- Por raids.

Mejora recomendada:

- No ordenar solo por volumen de commits validos.
- Crear rankings por categorias para que existan multiples formas de destacar.

### 6.5 Logros

Ejemplos:

- "Primer Push": conectar GitHub y completar primera sincronizacion.
- "Reviewer Noble": realizar varias reviews aprobadas.
- "Build Verde": mantener CI exitoso en repos activos.
- "Racha Serena": actividad constante durante varios dias.
- "Navegante de las Sombras": actividad nocturna ocasional.

Mejora recomendada:

- Evitar logros que incentiven habitos poco saludables como trabajar siempre de madrugada.
- Convertirlos en logros humoristicos de baja recompensa o cosmeticos.

## 7. UX/UI y Flujo del Usuario

### 7.0 Direccion Visual

La direccion visual apunta a una mezcla de RPG pixel-art, terminal retro, ventanas de sistema clasicas y energia cyberpunk. La referencia compartida muestra:

- Personajes tipo dev-fantasy con armaduras, capas, cascos o energia tecnologica.
- Escenarios de servidores, cables, monitores y codigo.
- UI con ventanas superpuestas, bordes marcados, barras de HP, textos tipo terminal y numeros de dano.
- Acciones de batalla exageradas, legibles y rapidas.

Decision tecnica/visual:

- Usar Three.js para escenarios, animaciones y personajes.
- En MVP se usaran placeholders simples, por ejemplo cuadrados o prismas con colores por tipo de personaje.
- Los assets finales seran propios y se generaran mas adelante.

### 7.1 Primer Ingreso

1. El usuario aterriza en una pantalla principal con la promesa del juego y el boton "Conectar GitHub".
2. Autoriza GitHub.
3. Ve una pantalla de carga con estetica de terminal simulando `git clone` de habilidades.
4. El sistema muestra que datos se estan analizando.
5. El usuario recibe su avatar inicial, stats y clase.
6. El usuario puede hacer su primera batalla de entrenamiento.

Mejora UX recomendada:

- La primera sesion debe terminar con una accion emocionante, no solo con un dashboard.
- Idealmente: conectar, ver personaje, entender 3 stats y jugar una batalla corta.

### 7.2 Dashboard Principal

Elementos principales:

- Avatar/personaje.
- Nivel y clase.
- Stats principales.
- Cambio desde la ultima sincronizacion.
- Botones: "Buscar oponente", "Entrenar", "Raids", "Ranking".
- Estado de sincronizacion con GitHub.

Mejora UX recomendada:

- Incluir un panel "Como mejorar tus stats" con recomendaciones concretas:
  - "Completa una PR con review para mejorar Defensa."
  - "Mantener actividad 3 dias esta semana sube tu HP."
  - "Agregar CI detectable mejora tu Guardia."

### 7.3 Batalla

La pantalla de batalla debe priorizar claridad y ritmo.

Elementos:

- Dos personajes enfrentados.
- Barras de HP.
- Log de turnos.
- Animaciones de ataque/defensa.
- Explicacion breve de efectos especiales.
- Resultado con recompensas y cambios de ranking.
- Boton "Skip" para saltar la animacion y ver el resultado.

Mejora UX recomendada:

- Agregar "replay textual" o resumen:
  - "Ganaste porque tu defensa bloqueo 28% del dano gracias a PRs aprobadas."

### 7.4 Privacidad y Control

El usuario debe poder:

- Ver que datos se usan.
- Excluir repositorios.
- Desconectar GitHub.
- Elegir si muestra stats publicamente.
- En futuras versiones, activar o no repos privados como opt-in avanzado.

## 8. Requisitos Tecnologicos

### Stack Objetivo

- Framework: Next.js 16 con App Router.
- Lenguaje: TypeScript.
- UI: React, Tailwind CSS.
- Escenas, personajes y animaciones de batalla: Three.js.
- Animaciones de UI: Framer Motion.
- Auth: Clerk con GitHub OAuth.
- Backend: Route Handlers y Server Actions de Next.js para MVP.
- Base de datos: PostgreSQL, Neon, Supabase o similar.
- ORM: Drizzle.
- Cache/colas: incorporar Redis, Upstash o Vercel KV/Queues solo cuando aparezca una necesidad real, manteniendo la arquitectura preparada para escalar.
- Deploy: Vercel.

Nota: el borrador original menciona React con Vite, pero para Next.js 16 App Router conviene unificar el frontend en Next.js.

### Servicios Internos

- Servicio de sincronizacion con GitHub.
- Servicio de calculo de stats.
- Servicio de matchmaking.
- Servicio de batalla.
- Servicio de logros.
- Servicio de ranking.

## 9. Riesgos y Decisiones Pendientes

### Riesgos

- Rate limits de GitHub API.
- Dificultad para medir calidad real de codigo.
- Incentivar commits artificiales.
- Desbalance entre usuarios con mucha y poca actividad.
- Exposicion accidental de datos privados.
- Complejidad de calcular stats de forma justa entre lenguajes y tipos de proyecto.

### Decisiones Pendientes

- Como normalizar actividad entre usuarios full-time, estudiantes y maintainers.
- Como combinar habilidades explicables con fantasia visual.
- Que nivel de interactividad tendran las batallas despues del MVP.
- Como modelar equipos, requisitos de ingreso y paises en una fase posterior.

### Decisiones Tomadas

- Autenticacion con Clerk y GitHub OAuth.
- MVP con repositorios publicos solamente.
- Batallas simuladas con opcion de "Skip".
- Enfoque inicial en jugadores individuales.
- Equipos, requisitos de ingreso y representacion por paises quedan para una fase futura.
- Assets propios a futuro; placeholders geometricos con colores por clase/personaje durante el MVP.
- Escenarios, personajes y animaciones de batalla con Three.js.
- Los personajes y habilidades deben ser una mezcla de reglas explicables y fantasia visual.

## 10. MVP Propuesto

El MVP deberia enfocarse en validar la fantasia principal: conectar GitHub, generar personaje y jugar una batalla corta.

Incluye:

- Login con GitHub.
- Sincronizacion de datos publicos.
- Calculo inicial de stats.
- Avatar/clase basada en lenguaje principal.
- Dashboard basico.
- Batalla de entrenamiento.
- Arena PvP asincronica simple.
- Batallas simuladas con boton "Skip".
- Escenario y personajes placeholder con Three.js.
- Historial de batallas.
- Ranking semanal basico.

No incluye inicialmente:

- Analisis profundo de codigo.
- Repos privados por defecto.
- Raids complejos.
- Equipos, paises y requisitos de ingreso.
- Marketplace de cosmeticos.
- Chat social.

## 11. Mejoras Funcionales Recomendadas

- Normalizar stats con curvas y limites para evitar que el volumen bruto domine.
- Agregar explicabilidad de stats para que el usuario confie en el sistema.
- Permitir excluir repositorios.
- Crear modo entrenamiento antes del PvP.
- Agregar recomendaciones accionables para mejorar personaje.
- Introducir rankings por liga, lenguaje y semana.
- Separar calidad real de codigo de senales proxy detectables en GitHub.
- Disenar logros que premien colaboracion, tests, reviews y constancia.
- Incluir historial y resumen de batalla para reforzar aprendizaje.
- Definir politicas anti-abuso desde el inicio.

## 12. Preguntas para la Proxima Iteracion

- El ranking sera competitivo serio o mas casual/social?
- Como se vera la primera version de cada clase usando placeholders geometricos?
- Que repos publicos deberian pesar mas como "ejercito": repos propios, forks, contribuciones a terceros o repos con actividad reciente?
- Que tipos de equipos y requisitos de ingreso queremos para la fase posterior?
- Como se representaran paises sin convertir el ranking en algo toxico o excluyente?

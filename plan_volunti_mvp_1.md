# Volunti — Plan Inicial: Plataforma de Coordinación de Ayuda Humanitaria
Terremoto Colombia, 10 de agosto 2026
_v2 — 100% Vercel, mobile-first, vibecoding_

## 1. Objetivo

Dar a fundaciones y organizaciones pequeñas una herramienta ligera para:
- Registrarse fácil (nombre, correo, contraseña o Google) y luego completar el perfil de su fundación adentro.
- Registrar inventario disponible (qué tienen para dar).
- Registrar/consultar necesidades por población afectada (qué falta y dónde).
- Registrar voluntarios/mano de obra disponible y su disponibilidad.
- Ver un panorama general para poder coordinarse entre sí manualmente en Fase 1, y automáticamente en Fase 2.
- Usarse principalmente desde el celular, sin que se rompa en pantallas grandes.

## 2. Fases

### Fase 1 — MVP de lanzamiento inmediato (objetivo: 1-2 días)
Incluye: registro simple, perfil de fundación, inventario, necesidades por población, voluntarios, y un dashboard de consulta/cruce manual.
No incluye todavía: matching automático (se agrega en Fase 2 una vez haya data real cargada).

### Fase 2 — Automatización (después de tener data real fluyendo)
- Matching sugerido automático (inventario ↔ necesidad, voluntario ↔ necesidad de mano de obra).
- Alertas de necesidades sin cubrir por mucho tiempo.
- Notificaciones (WhatsApp/email) cuando aparece un match relevante.
- Jobs en background (Vercel Cron + Route Handlers alcanza para este volumen; no hace falta BullMQ/Redis todavía).

## 3. Stack técnico (Fase 1) — todo en Vercel + GitHub

- **Frontend + Backend:** Next.js (App Router), un solo proyecto. Las pantallas y los endpoints (Route Handlers / Server Actions) viven juntos, deploy único.
- **Base de datos:** Vercel Postgres (Neon por debajo) — se crea desde el mismo dashboard de Vercel, sin cuenta ni servicio aparte.
- **ORM:** Drizzle — esquema como código TypeScript versionado en el repo, migraciones con un comando. Ligero y directo, ideal para iterar rápido con Claude Code.
- **Auth:** NextAuth.js (Auth.js) con dos providers:
  - Google (para "Continuar con Gmail").
  - Credentials (nombre + correo + contraseña, hash con bcrypt).
  - El registro solo pide nombre, correo y contraseña (o Google). El perfil de la fundación se completa después, ya dentro de la plataforma.
- **Storage** (para fotos/evidencia, si se necesita): Vercel Blob.
- **UI:** Tailwind + shadcn/ui, diseñado **mobile-first** (se construye primero para pantalla chica y se adapta hacia arriba con breakpoints, no al revés).
- **CI/CD:** repo en GitHub conectado directo a Vercel — push a `main` = deploy a producción automático, cada Pull Request genera su propio preview URL. Opcional: un GitHub Action liviano de lint/typecheck como gate antes del deploy.

Nota de honestidad técnica: al no usar Supabase, la autenticación y los permisos (que un usuario solo edite su propia fundación) hay que codificarlos a mano en cada Route Handler — es más código que con Supabase, pero es código simple, predecible, y queda 100% versionado en Git, lo cual encaja mejor con vibecoding que administrar reglas desde un panel externo.

## 4. Modelo de datos (Fase 1)

### `users`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | |
| email | text | único |
| password_hash | text | nullable si el usuario entró por Google |
| auth_provider | text | `google` o `credentials` |
| organization_id | uuid (fk, nullable) | null hasta que complete el perfil de su fundación |
| created_at | timestamptz | |

### `organizations`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | |
| focus_areas | text[] | tags: personas, animales, ambos |
| categories | text[] | tags de ayuda: alimentos, agua, salud, vivienda, ropa, higiene, rescate, psicosocial, educación, transporte, mano_de_obra |
| description | text | |
| contact_phone / contact_whatsapp | text | |
| city / department | text | |
| lat / lng | float | opcional, para mapa |
| capacity_notes | text | ej: "podemos almacenar hasta 2 toneladas" |
| verified | boolean | default false, para marcar fundaciones validadas manualmente si se necesita después |
| created_at | timestamptz | |

### `populations` (poblaciones/comunidades objetivo)
Pre-cargar con la data de tu investigación: Cali, Pereira, Quibdó, Manizales, Armenia (y las que vayan agregando).
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | ej: "Cali - Comuna 3" |
| city / department | text | |
| lat / lng | float | |
| priority_level | text | rojo / amarillo / verde |
| estimated_affected | int | |
| notes | text | |

### `needs`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| population_id | uuid (fk) | |
| category | text | mismo taxonomy de arriba |
| description | text | |
| quantity_needed | numeric | |
| unit | text | ej: kg, litros, personas, unidades |
| urgency | text | alta / media / baja |
| status | text | abierta / parcial / cubierta |
| reported_by_org_id | uuid (fk, nullable) | |
| updated_at | timestamptz | |

### `inventory`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| organization_id | uuid (fk) | |
| category | text | mismo taxonomy |
| item_name | text | |
| quantity | numeric | |
| unit | text | |
| status | text | disponible / reservado / entregado |
| location | text | |
| notes | text | |
| updated_at | timestamptz | |

### `volunteers`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| organization_id | uuid (fk, nullable) | nullable = voluntario independiente |
| name | text | |
| contact_phone | text | |
| skills | text[] | rescate, médico, logística, conducción, psicología, construcción, etc. |
| city | text | |
| availability_from / availability_to | date | |
| status | text | disponible / asignado / no_disponible |

## 5. Flujos / pantallas (Fase 1) — mobile-first

Diseño: se piensa primero para una sola columna, botones grandes tocables, navegación inferior tipo app en móvil; en pantallas grandes esa misma navegación pasa a sidebar y las tarjetas se acomodan en grilla/tabla. No se construyen dos diseños distintos, es el mismo layout con breakpoints de Tailwind.

1. **Landing pública** — explica qué es la plataforma, botón "Registrarme" y botón "Ver panorama actual" (acceso sin login).
2. **Registro** — solo nombre, correo, contraseña, o botón "Continuar con Google". Un paso, sin fricción.
3. **Onboarding de fundación (primera vez que entra)** — formulario de perfil (focus_areas, categories, ubicación, capacidad). Se puede omitir y completar después, pero se le recuerda hasta que lo llene.
4. **Panel de la fundación (privado, requiere login):**
   - Mi inventario: lista tipo tarjeta en móvil / tabla en desktop, con alta rápida.
   - Mis voluntarios: mismo patrón.
5. **Panorama general (público, sin login):**
   - Tab "Necesidades por población" — filtrable por ciudad, categoría, urgencia.
   - Tab "Inventario disponible" — filtrable por categoría, ciudad.
   - Tab "Voluntarios disponibles" — filtrable por skill, ciudad, disponibilidad.
   - (Opcional si da tiempo) vista de mapa con las poblaciones coloreadas por prioridad.
6. **Formulario "Reportar necesidad"** — cualquier fundación logueada puede reportar una necesidad para una población (o crear una población nueva si no existe).

## 6. Orden de construcción sugerido (guía flexible para vibecoding con Claude Code)

Esto es una guía de checkpoints, no un ticket rígido — la idea es ir iterando con Claude Code prompt a prompt y ajustar sobre la marcha:

1. Repo en GitHub + proyecto Next.js (App Router) + Tailwind + shadcn/ui, conectado a Vercel desde el día 1 (deploy vacío funcionando).
2. Vercel Postgres + Drizzle: definir el esquema de las 6 tablas de arriba, correr la primera migración.
3. NextAuth.js: Google provider + Credentials provider, páginas de registro/login mobile-first.
4. Onboarding de perfil de fundación después del primer login.
5. CRUD de inventario (fundación logueada).
6. CRUD de voluntarios (fundación logueada).
7. Seed de `populations` con la data real del terremoto (Cali, Pereira, Quibdó, Manizales, Armenia).
8. Formulario de reporte de necesidades.
9. Dashboard público con las 3 tablas/tarjetas filtrables, mobile-first.
10. Pulir responsive en pantallas grandes (sidebar, grillas).
11. (Si sobra tiempo) vista de mapa simple con Leaflet/Mapbox.

Cada punto es deployable por separado gracias al pipeline de GitHub → Vercel: se puede ir probando en producción real desde el primer commit.

## 7. Fuera de alcance en Fase 1 (a propósito)

- Matching automático oferta/demanda.
- Notificaciones push/WhatsApp.
- Verificación robusta de identidad de fundaciones (queda como campo `verified` manual por ahora).
- Reportes/analytics avanzados.

## 8. Próximo paso

Con este documento, el siguiente paso es abrir Claude Code sobre un repo nuevo en GitHub y pedirle que ejecute el "Orden de construcción sugerido" checkpoint por checkpoint, empezando por el proyecto Next.js + conexión a Vercel.

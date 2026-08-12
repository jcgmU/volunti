# Workflow del proyecto Volunti

## Roles
- **Orquestador (Claude):** coordina el trabajo, habla con Cami, es dueño de todo lo que sea Vercel.
- **Planificador (OpenCode):** diseña los planes concretos de cada checkpoint.
- **Constructor (agy):** ejecuta los planes en el repo.

## Regla de tooling

### Vercel → solo el orquestador, vía MCP oficial
Todo lo relacionado con Vercel (env vars, deployments, gestión del proyecto) lo maneja el orquestador directamente a través del MCP oficial de Vercel (mcp.vercel.com). Nunca se usa `vercel` CLI para esto ni se le pide a Cami que entre al dashboard.

**Excepción aprobada por Cami:** agy puede usar `vercel link` y `vercel env pull .env.local` localmente para obtener el `DATABASE_URL` real, porque el MCP de Vercel no expone valores de env vars por diseño. Es la única razón válida para tocar `vercel` CLI.

### Todo lo demás → CLI directo (agy)
`gh`, `npm`, `git`, `drizzle-kit` y cualquier herramienta no-Vercel los ejecuta agy directo por CLI.

### PASOS_MANUALES.md
Reservado solo para lo verdaderamente imposible de automatizar. Antes de agregar algo ahí, confirmar con el orquestador que no existe vía automatizada.

## Flujo de despacho
El planificador (opencode) despacha los planes directo a agy por Herdr una vez diseñados, sin pasar por el orquestador. El orquestador solo recibe un resumen corto del despacho y lee el reporte final directo de agy.

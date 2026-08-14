# Workflow del proyecto Volunti

## Roles
- **Orquestador (Claude):** coordina el trabajo, habla con Cami, es dueño de todo lo que sea Vercel. No escribe código.
- **Planificador (Kimi):** diseña los planes concretos de cada checkpoint/feature y los despacha directo a agy por Herdr. Reemplaza a OpenCode como planificador principal (OpenCode queda como fallback histórico si Kimi no está disponible).
- **Constructor (agy):** ejecuta los planes en el repo y le reporta el resultado al orquestador.

## Regla de tooling

### Vercel → solo el orquestador (MCP oficial o CLI global)
Todo lo relacionado con Vercel (env vars, deployments, gestión del proyecto) lo maneja el orquestador, por la vía que sea más práctica para cada caso: el MCP oficial de Vercel (mcp.vercel.com) o la CLI global de Vercel (vercel@global, ya instalada y autenticada con la cuenta jcgmu). Nunca se le pide a Cami que entre al dashboard.

**Excepción aprobada por Cami:** agy puede usar `vercel link` y `vercel env pull .env.local` localmente para obtener el `DATABASE_URL` real, porque el MCP de Vercel no expone valores de env vars por diseño. Es la única razón válida para que agy toque `vercel` CLI.

### Todo lo demás → CLI directo (agy)
`gh`, `npm`, `git`, `drizzle-kit` y cualquier herramienta no-Vercel los ejecuta agy directo por CLI.

### PASOS_MANUALES.md
Reservado solo para lo verdaderamente imposible de automatizar. Antes de agregar algo ahí, confirmar con el orquestador que no existe vía automatizada.

## Flujo de despacho
El planificador (Kimi) despacha los planes directo a agy por Herdr una vez diseñados, sin pasar por el orquestador. El orquestador solo recibe un resumen corto del despacho y lee el reporte final directo de agy. El orquestador sigue siendo quien verifica (lint/tsc/build/revisión de seguridad), pushea y confirma en producción — nunca se salta ese paso aunque el ciclo planificador→constructor sea autónomo.

## Skill de diseño: UI UX Pro Max
Para trabajo de UI/UX (landing page, rediseños, nuevos flujos visuales), tanto el planificador como el constructor deben instalar y usar la skill `ui-ux-pro-max` (https://ui-ux-pro-max-skill.nextlevelbuilder.io/, repo: github.com/nextlevelbuilder/ui-ux-pro-max-skill):

```bash
npm install -g ui-ux-pro-max-cli
cd /Users/jcgm/Desktop/Volunti
uipro init --ai antigravity   # agy
uipro init --ai claude        # kimi (no tiene flag propio, usa el formato claude que es el más portable)
```

Provee una base de datos buscable de estilos UI, paletas de color, tipografías, patrones de landing page (14 estructuras optimizadas para conversión) y guías de UX/accesibilidad. Se consulta con:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Volunti"
```
Cualquier entregable de UI nuevo debe pasar el checklist de calidad de la skill: iconos SVG (no emojis), feedback en hover, contraste en dark mode, layout responsive.

## Testing: TestSprite CLI
Instalado globalmente (`npm i -g @testsprite/testsprite-cli`) y conectado a la cuenta de Cami (jcgm1047@gmail.com). Después de cualquier cambio en la plataforma, se debe correr una verificación con TestSprite antes de considerar el trabajo terminado.

- **Proyecto:** Volunti — `projectId: 9309ebd8-c401-49ed-8024-1b702a694c7b` (tipo frontend, apunta a `https://volunti.vercel.app`)
- **Skills instaladas para Claude Code:** `.claude/skills/testsprite-verify/`, `.claude/skills/testsprite-onboard/` (también instaladas para antigravity en `.agents/skills/`, así agy puede usarlas directo)
- **Quién la corre: agy, siempre.** No el orquestador. Las credenciales quedan en `~/.testsprite/credentials` (nivel de usuario del sistema, no del proyecto), así que agy ya tiene acceso directo al CLI sin configuración adicional.
- Ya existe un set inicial de 8 tests (solo flujos públicos de solo-lectura: landing, /panorama, /ofertas, /login, aviso legal, footer con atribución DevIA — deliberadamente sin tests que escriban datos, porque Volunti corre contra la base de produccion real y no hay entorno de staging). Los planes fuente estan en `testsprite-plans/*.json` en la raiz del repo.
- **Despues de CUALQUIER cambio de codigo**, agy debe correr los tests relevantes al area que toco (por testId, no necesariamente todos — cuidar creditos) antes de reportarle al orquestador, usando la skill `testsprite-verify` instalada en `.agents/skills/testsprite-verify/` (o `.claude/skills/testsprite-verify/` si el agente corre sobre Claude Code):
  ```bash
  testsprite test run <testId> --wait
  ```
  Para correr todos: `testsprite test run --all --project 9309ebd8-c401-49ed-8024-1b702a694c7b` (usar con criterio, no de forma automatica en cada cambio chico).
- Si un cambio agrega una superficie nueva que valga la pena testear (nueva pagina publica, nuevo flujo), agy puede sumar un plan nuevo a `testsprite-plans/` siguiendo la skill `testsprite-onboard` y crearlo con `testsprite test create-batch --plan-from-dir ./testsprite-plans`.
- agy reporta el resultado (pass/fail, testId, link al dashboard) junto con el resto de su verificacion (lint/tsc/build) en el mismo reporte final al orquestador.

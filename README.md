# Prueba técnica — Code Review (Full Stack)

## Contexto

Estás ingresando como ingeniero full-stack al equipo que desarrolla **Avila Habit**, una aplicación de seguimiento de hábitos. El repositorio es un monorepo con Turborepo que contiene:

- `apps/api` — Backend en Fastify + TypeScript con arquitectura hexagonal / DDD
- `apps/client` — Frontend en Next.js 15 (App Router) con React Query y Tailwind CSS

### Qué hace el producto

Avila Habit permite a los usuarios crear y hacer seguimiento de hábitos personales. Las entidades centrales son:

**Hábito (`Habit`)**
Cada hábito tiene:
- **Nombre y descripción** libres.
- **Schedule (frecuencia):** puede ser `daily` (todos los días), `weekly` (un día fijo de la semana, o `weeklyFlexible = true` para completarlo cualquier día de esa semana) o `custom` (días específicos de la semana, e.g. lunes, miércoles y viernes).
- **Goal (meta):** una cantidad objetivo (`target`), una unidad (`unit`, e.g. "vasos", "minutos", "km") y un período (`day` o `week`). El progreso se acumula hasta alcanzar el target.
- **TimeOfDay:** `morning`, `afternoon` o `evening`. Determina en qué sección del día aparece el hábito.
- **Reminder:** recordatorio opcional con hora en formato `HH:mm`.
- **Rango de fechas:** `startDate` y `endDate` opcionales. Si la fecha consultada cae fuera del rango, el hábito no aparece.
- **Status:** un hábito puede estar `active`, `paused` (el usuario lo suspendió temporalmente), o `blocked` (bloqueado por alguna razón externa). Un hábito eliminado se marca con `isActive = false` (soft delete).

**Registro de avance (`HabitLog`)**
Cada vez que el usuario reporta progreso, se crea o actualiza un `HabitLog`. Las reglas clave:
- Para hábitos con meta diaria (`period: day`): existe un único log por día.
- Para hábitos con meta semanal (`period: week`): existe un único log por semana.
- El valor se acumula: si la meta es "beber 8 vasos" y el usuario reporta 3, luego 3 más, el log llega a 6. Cuando `value >= target`, el log se marca `completed = true`.
- No se puede registrar progreso en un hábito pausado, bloqueado o eliminado.

**Vista del día**
El frontend consulta los hábitos del usuario para una fecha específica y los divide en dos listas:
- `today`: hábitos con meta diaria que aplican para ese día.
- `week`: hábitos con meta semanal que aplican para esa semana.

Junto a estas listas, la API devuelve un `summary` con el conteo de hábitos completados, el total y la tasa de completitud del usuario para ese período.

---

Un compañero de equipo entregó un lote de funcionalidades durante un fin de semana ajetreado. El código corre en desarrollo, pero contiene problemas reales que afectarían a usuarios, expondrían vulnerabilidades de seguridad o corromperían datos en producción de forma silenciosa.

Tu tarea: revisar el código, identificar los problemas, proponer correcciones y compartir tu lectura general del estado del proyecto.

---

## Instrucciones importantes

- **No es necesario ejecutar el código.** La prueba es de revisión estática; todo lo que necesitas está en los archivos.
- Los **archivos a revisar** son los listados en la siguiente sección. Ahí se encuentran todos los hallazgos.
- El **resto del repositorio** (dominio, puertos, módulos, configuración) puede consultarse libremente como contexto para entender la arquitectura y las convenciones del equipo.
- Se permite el uso de **asistentes de IA** (ChatGPT, Copilot, Claude, Gemini, etc.) como herramienta de apoyo.
- Tiempo estimado: **3–4 horas.**

---

## Archivos a revisar

Todos los hallazgos se encuentran dentro de los archivos listados a continuación y deben ser lo que se deben de someter al proceso de code review.

**Backend — `apps/api/src/`**

| Archivo | Descripción |
|---------|-------------|
| `modules/habit/infrastructure/mappers/habit.mapper.ts` | Serializa datos de dominio para las respuestas HTTP |
| `modules/habit/application/use-case/getHabitsForDate.useCase.ts` | Retorna los hábitos programados para una fecha dada |
| `modules/habit/application/use-case/getHabitSummary.useCase.ts` | Agrega estadísticas de completitud de hábitos |
| `modules/habitLog/infrastructure/http/habitLog.controller.ts` | Controlador HTTP para leer y escribir registros de hábitos |
| `modules/habitLog/infrastructure/persistent/HabitLogPostgresRepository.ts` | Adaptador de base de datos para los registros de hábitos |
| `modules/habitLog/application/use-case/upsertHabitLog.useCase.ts` | Lógica de negocio principal para registrar avance en un hábito |
| `modules/user/domain/entities/user.entity.ts` | Entidad de dominio del usuario |
| `modules/user/infrastructure/persistent/UserPostgresRepository.ts` | Adaptador de base de datos para usuarios |
| `modules/user/infrastructure/mappers/user.mapper.ts` | Serializa usuarios para las respuestas HTTP |

**Schemas — `packages/schemas/src/`**

| Archivo | Descripción |
|---------|-------------|
| `habits/habit.dto.ts` | Esquemas Zod y tipos TypeScript para los contratos de la API de hábitos |

**Frontend — `apps/client/src/`**

| Archivo | Descripción |
|---------|-------------|
| `features/habits/ui/widgets/HabitDayView.tsx` | Componente cliente que muestra y registra hábitos para un día dado |

---

## Contexto de apoyo (consultar, no modificar)

Para entender la arquitectura y las convenciones del equipo, puedes leer:

- `CLAUDE.md` y `apps/api/CLAUDE.md` — resumen de arquitectura y reglas del proyecto
- `apps/api/src/modules/habit/domain/` — modelo de dominio del hábito (entidades, value objects, lógica de calendario)
- `apps/api/src/modules/habitLog/domain/` — modelo de dominio del registro de hábitos

---

## Qué entregar

crea un archivo llamado `REVIEW.md` en la raíz del repositorio con la siguiente estructura:

```markdown
# Code Review — [Tu nombre]

## Resumen del codebase

Describe con tus propias palabras cómo está organizado el proyecto, qué patrones
arquitectónicos se usan y cuál es tu impresión general del estado del código.

## Fortalezas

Lista (3–5 puntos) lo que el equipo está haciendo bien a nivel de arquitectura,
organización, convenciones o calidad del código.

## Oportunidades de mejora generales

Más allá de los hallazgos puntuales, ¿qué cambiarías o reforzarías de forma
transversal en el proyecto? (Puede incluir patrones, tooling, documentación, pruebas, etc.)

## Hallazgos

### Hallazgo N: [Título corto]
- **Archivo**: ruta/al/archivo.ts:línea
- **Categoría**: Lógica de negocio | Performance | React | Seguridad | Arquitectura
- **Severidad**: Crítica | Alta | Media | Baja
- **Problema**: explica qué está mal y *por qué* importa en producción o para el usuario
- **Corrección**: código corregido o descripción clara del enfoque correcto

[Repetir para cada hallazgo]

## Propuesta de producto

Habiendo revisado el codebase y entendido qué hace la aplicación, propón **1 a 3 features**
que agregarías al producto y explica por qué. No es necesario que sean técnicamente
elaboradas — lo que buscamos es tu razonamiento: qué problema del usuario resuelven,
por qué las priorizarías sobre otras ideas y, si aplica, cómo encajarían en el modelo
de dominio actual.

## Uso de IA

Si utilizaste algún asistente de IA durante la prueba, descríbelo aquí con detalle:
- ¿Qué herramienta(s) usaste?
- ¿Para qué tareas específicas la usaste ?
- ¿Cómo validaste o cuestionaste lo que te devolvió?
- ¿Hubo algún caso donde el output de la IA fue incorrecto o misleading?

Si no usaste IA, simplemente escribe: `No utilicé asistentes de IA.`
```

**Máximo 15 hallazgos.** Si encuentras más, prioriza los de mayor impacto.

Buena suerte.

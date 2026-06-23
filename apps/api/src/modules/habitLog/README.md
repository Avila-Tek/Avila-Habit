# HabitLog Module

Modulo de registro de progreso de habitos siguiendo arquitectura hexagonal (Ports & Adapters) con Domain-Driven Design.

## Arquitectura

```
habitLog/
├── domain/                    # Capa de dominio (sin dependencias externas)
│   ├── entities/              # Agregados y entidades
│   ├── value-objects/         # Objetos de valor inmutables
│   └── errors/                # Errores de dominio tipados
├── application/               # Capa de aplicacion
│   ├── ports/                 # Interfaces (contratos)
│   └── use-case/              # Casos de uso
└── infrastructure/            # Capa de infraestructura
    ├── http/                  # Controllers y rutas
    ├── persistent/            # Repositorios (PostgreSQL)
    └── mappers/               # Transformacion de datos
```

## Dominio

### Entidad: HabitLog

Agregado principal que representa un registro de progreso de un habito.

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | `HabitLogId` | Identificador unico (UUID) |
| `userId` | `string` | ID del usuario propietario |
| `habitId` | `string` | ID del habito asociado |
| `logDate` | `Date` | Fecha del registro (normalizada) |
| `completed` | `boolean` | Si se cumplio la meta |
| `completedAt` | `Date?` | Fecha/hora de completado |
| `value` | `number` | Valor acumulado del progreso |
| `createdAt` | `Date` | Fecha de creacion |
| `updatedAt` | `Date` | Ultima actualizacion |

### Value Objects

#### HabitLogId

Identificador unico inmutable para registros de habitos.

```typescript
HabitLogId.create('uuid-string')
```

### Normalizacion de Fechas

El modulo normaliza las fechas segun el periodo del objetivo del habito:

#### Habitos Diarios (`period: 'day'`)
- La fecha se normaliza a medianoche UTC del dia
- Ejemplo: `2025-01-15T14:30:00Z` -> `2025-01-15T00:00:00Z`

#### Habitos Semanales (`period: 'week'`)
- La fecha se normaliza al lunes de la semana (inicio de semana ISO)
- **Importante**: Usa calculos UTC para evitar problemas de zona horaria
- Ejemplo:
  - `2025-12-29` (Lunes) -> `2025-12-29T00:00:00Z`
  - `2026-01-04` (Domingo) -> `2025-12-29T00:00:00Z` (mismo lunes)

```typescript
// Ambas fechas pertenecen a la misma semana
HabitLog.getWeekRange(new Date('2025-12-29')); // { start: 2025-12-29, end: 2026-01-04 }
HabitLog.getWeekRange(new Date('2026-01-04')); // { start: 2025-12-29, end: 2026-01-04 }
```

### Errores de Dominio

| Error | Codigo HTTP | Descripcion |
|-------|-------------|-------------|
| `HabitLogNotFoundError` | 404 | Registro no encontrado |
| `ValueExceedsTargetError` | 400 | Valor excede el objetivo |
| `HabitNotLoggableError` | 403 | No se puede registrar (pausado/bloqueado/eliminado) |
| `InvalidHabitLogDataError` | 400 | Datos invalidos (ej: log ya completado) |

## Casos de Uso

### UpsertHabitLogUseCase

Crea o actualiza un registro de habito. Implementa logica de upsert:

1. **Busca registro existente** para el periodo (dia/semana)
2. **Si no existe**: Crea nuevo registro
3. **Si existe y no esta completado**: Acumula el valor
4. **Si existe y esta completado**: Lanza `InvalidHabitLogDataError`

#### Validaciones

- El habito debe existir y pertenecer al usuario
- El habito debe estar activo (no eliminado)
- El habito no debe estar pausado ni bloqueado
- El valor se capea al target maximo

#### Completado Automatico

El registro se marca como `completed: true` cuando `value >= goal.target`.

```typescript
const command = {
  userId: 'user-123',
  habitId: 'habit-456',
  logDate: new Date('2025-01-15'),
  value: 1,
};

const habitLog = await upsertHabitLogUseCase.execute(command);
```

### FindHabitLogsUseCase

Lista registros de habitos con filtros y paginacion.

```typescript
const query = {
  userId: 'user-123',
  habitId: 'habit-456',      // opcional
  startDate: new Date(...),  // opcional
  endDate: new Date(...),    // opcional
  limit: 10,
  offset: 0,
};

const habitLogs = await findHabitLogsUseCase.execute(query);
```

## API Endpoints

Base URL: `/v1/habit-logs`

### Endpoints

```
POST   /                  Crear/actualizar registro (upsert)
GET    /                  Listar registros (paginado)
```

### Request: Upsert HabitLog

```json
POST /v1/habit-logs
{
  "habitId": "uuid",
  "logDate": "2025-01-15",
  "value": 1
}
```

### Response: HabitLog

```json
{
  "id": "uuid",
  "userId": "uuid",
  "habitId": "uuid",
  "logDate": "2025-01-15",
  "completed": false,
  "completedAt": null,
  "value": 1,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Query: Find HabitLogs

```
GET /v1/habit-logs?habitId=uuid&startDate=2025-01-01&endDate=2025-01-31&limit=10&offset=0
```

## Dependencias

### Ports (Interfaces)

| Port | Descripcion |
|------|-------------|
| `IHabitLogRepository` | Persistencia de registros |
| `IUpsertHabitLogUseCase` | Caso de uso upsert |
| `IFindHabitLogsUseCase` | Caso de uso busqueda |

### Adapters (Implementaciones)

| Adapter | Implementa |
|---------|------------|
| `HabitLogPostgresRepository` | `IHabitLogRepository` |

### Dependencias Externas

| Modulo | Uso |
|--------|-----|
| `habit` | `IHabitRepository` para validar existencia y estado |

## Base de Datos

### Tabla: HabitLog

```sql
CREATE TABLE "HabitLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "habitId" UUID NOT NULL REFERENCES "Habit"("id") ON DELETE CASCADE,
  "logDate" DATE NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMPTZ,
  "value" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE ("userId", "habitId", "logDate")
);

CREATE INDEX "habit_logs_user_log_date_idx" ON "HabitLog" ("userId", "logDate");
```

### Constraint Unico

El constraint `(userId, habitId, logDate)` asegura que solo exista un registro por habito por periodo (dia o semana normalizada).

## Tests

Ubicacion: `apps/api/test/habitLog/`

```bash
# Ejecutar tests del modulo
npm -C apps/api test -- --run test/habitLog
```

### Cobertura de Tests

| Use Case | Tests |
|----------|-------|
| `UpsertHabitLogUseCase` | Creacion, actualizacion, completado, errores, normalizacion de semanas |
| `FindHabitLogsUseCase` | Listado, filtros, paginacion |

## Flujo de Datos

```
┌─────────────┐     ┌────────────────┐     ┌─────────────────────┐
│   Request   │────>│   Controller   │────>│   UpsertUseCase     │
└─────────────┘     └────────────────┘     └─────────────────────┘
                                                    │
                                                    v
                                           ┌─────────────────────┐
                                           │  HabitRepository    │
                                           │  (validar habito)   │
                                           └─────────────────────┘
                                                    │
                                                    v
                                           ┌─────────────────────┐
                                           │ HabitLogRepository  │
                                           │ (buscar existente)  │
                                           └─────────────────────┘
                                                    │
                              ┌─────────────────────┴─────────────────────┐
                              v                                           v
                    ┌─────────────────┐                         ┌─────────────────┐
                    │  No existe      │                         │  Existe         │
                    │  -> create()    │                         │  -> update()    │
                    └─────────────────┘                         └─────────────────┘
                              │                                           │
                              └─────────────────────┬─────────────────────┘
                                                    v
                                           ┌─────────────────────┐
                                           │     Response        │
                                           └─────────────────────┘
```

## Extensibilidad

### Agregar Nuevo Use Case

1. Crear port en `application/ports/`:
```typescript
export interface IMyNewUseCase {
  execute(command: MyCommand): Promise<Result>;
}
```

2. Crear use case en `application/use-case/`:
```typescript
export class MyNewUseCase implements IMyNewUseCase {
  constructor(private readonly habitLogRepository: IHabitLogRepository) {}

  async execute(command: MyCommand): Promise<Result> {
    // Logica
  }
}
```

3. Registrar en `infrastructure/habitLog.module.ts`
4. Agregar metodo en controller y ruta

### Agregar Nuevo Periodo

Para soportar periodos mensuales:

1. Agregar metodo en `HabitLog.entity.ts`:
```typescript
static getMonthRange(date: Date): { start: Date; end: Date } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return { start, end };
}
```

2. Actualizar `normalizeDateForPeriod()` para manejar `'month'`
3. Actualizar repositorio para consultas por mes

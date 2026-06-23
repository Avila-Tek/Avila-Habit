# Habit Module

Módulo de gestión de hábitos siguiendo arquitectura hexagonal (Ports & Adapters) con Domain-Driven Design.

## Changelog

### 2026-01-30: Validación de Límites de Hábitos

- Agregado `HabitLimitExceededError` - Error cuando se excede el límite del plan
- Agregado `IHabitLimitChecker` port - Interface para verificar límites
- Agregado `HabitLimitChecker` provider - Implementación que consulta suscripción activa
- Modificado `CreateHabitUseCase` - Ahora valida límite antes de crear hábito
- Agregada dependencia con `plan-module` para obtener suscripción del usuario

## Arquitectura

```
habit/
├── domain/                    # Capa de dominio (sin dependencias externas)
│   ├── entities/              # Agregados y entidades
│   ├── value-objects/         # Objetos de valor inmutables
│   ├── errors/                # Errores de dominio tipados
│   └── events/                # Eventos de dominio
├── application/               # Capa de aplicación
│   ├── ports/                 # Interfaces (contratos)
│   └── use-case/              # Casos de uso
└── infrastructure/            # Capa de infraestructura
    ├── http/                  # Controllers y rutas
    ├── persistent/            # Repositorios (PostgreSQL)
    ├── providers/             # Proveedores externos (Algolia)
    └── mappers/               # Transformación de datos
```

## Dominio

### Entidad: Habit

Agregado principal que representa un hábito del usuario.

| Propiedad     | Tipo            | Descripción                   |
| ------------- | --------------- | ----------------------------- |
| `id`          | `HabitId`       | Identificador único (UUID)    |
| `userId`      | `string`        | ID del usuario propietario    |
| `name`        | `string`        | Nombre del hábito             |
| `description` | `string?`       | Descripción opcional          |
| `schedule`    | `HabitSchedule` | Configuración de frecuencia   |
| `goal`        | `HabitGoal`     | Meta a cumplir                |
| `timeOfDay`   | `TimeOfDay`     | Momento del día preferido     |
| `reminder`    | `HabitReminder` | Configuración de recordatorio |
| `status`      | `HabitStatus`   | Estado actual                 |
| `isActive`    | `boolean`       | Soft delete flag              |
| `startDate`   | `Date?`         | Fecha de inicio opcional      |
| `endDate`     | `Date?`         | Fecha de fin opcional         |
| `createdAt`   | `Date`          | Fecha de creación             |
| `updatedAt`   | `Date`          | Última actualización          |

### Value Objects

#### HabitStatus

Estados posibles del hábito:

- `active` - Hábito activo y funcionando
- `paused` - Pausado temporalmente por el usuario
- `blocked` - Bloqueado (no permite modificaciones)

#### HabitSchedule

Configuración de frecuencia:

- `type`: `daily` | `weekly` | `custom`
- `daysOfWeek`: Array de días (0-6, donde 0 = Domingo)
- `weeklyDay`: Día específico para tipo weekly
- `weeklyFlexible`: Si permite flexibilidad en weekly

#### HabitGoal

Meta del hábito:

- `unit`: Unidad de medida (ej: "veces", "minutos", "km")
- `period`: `daily` | `weekly` | `monthly`
- `target`: Valor numérico objetivo

#### TimeOfDay

Momento preferido: `morning` | `afternoon` | `evening` | `anytime`

#### HabitReminder

- `enabled`: Si está activo
- `time`: Hora del recordatorio (formato HH:mm)

### Errores de Dominio

| Error                              | Código HTTP | Descripción                          |
| ---------------------------------- | ----------- | ------------------------------------ |
| `HabitNotFoundError`               | 404         | Hábito no encontrado                 |
| `HabitAlreadyPausedError`          | 409         | Ya está pausado                      |
| `HabitAlreadyActiveError`          | 409         | Ya está activo                       |
| `HabitAlreadyBlockedError`         | 409         | Ya está bloqueado                    |
| `HabitBlockedError`                | 403         | Operación no permitida (bloqueado)   |
| `HabitDeletedError`                | 410         | Hábito eliminado                     |
| `HabitLimitExceededError`          | 403         | Límite de hábitos del plan alcanzado |
| `InvalidScheduleError`             | 400         | Programación inválida                |
| `InvalidGoalError`                 | 400         | Meta inválida                        |
| `InvalidReminderError`             | 400         | Recordatorio inválido                |
| `SearchIndexError`                 | 500         | Error de Algolia                     |
| `SearchProviderNotConfiguredError` | 503         | Algolia no configurado               |

## Casos de Uso

### CRUD Básico

| Use Case              | Descripción                                   |
| --------------------- | --------------------------------------------- |
| `CreateHabitUseCase`  | Crea un nuevo hábito (valida límite del plan) |
| `FindHabitUseCase`    | Obtiene un hábito por ID                      |
| `FindHabitsUseCase`   | Lista hábitos del usuario (paginado)          |
| `UpdateHabitUseCase`  | Actualiza propiedades del hábito              |
| `DeleteHabitUseCase`  | Soft delete del hábito                        |
| `RestoreHabitUseCase` | Restaura un hábito eliminado                  |

### Gestión de Estado

| Use Case                 | Descripción                |
| ------------------------ | -------------------------- |
| `PauseHabitUseCase`      | Pausa el hábito            |
| `ReactivateHabitUseCase` | Reactiva un hábito pausado |
| `BlockHabitUseCase`      | Bloquea el hábito          |
| `UnblockHabitUseCase`    | Desbloquea el hábito       |

### Búsqueda (Algolia)

| Use Case                 | Descripción                          |
| ------------------------ | ------------------------------------ |
| `GetSearchApiKeyUseCase` | Genera Secured API Key para frontend |

### Validación de Límites (Plan)

El `CreateHabitUseCase` valida que el usuario no exceda el límite de hábitos definido en su plan de suscripción:

| Componente           | Descripción                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `IHabitLimitChecker` | Port que verifica si el usuario puede crear más hábitos                       |
| `HabitLimitChecker`  | Implementación que consulta la suscripción activa y cuenta hábitos existentes |

**Flujo de validación:**

1. Obtiene la suscripción activa del usuario (vía `plan-module`)
2. Extrae `limits.habitsMax` del plan
3. Cuenta los hábitos activos del usuario
4. Si `current >= limit`, lanza `HabitLimitExceededError` (HTTP 403)

**Notas:**

- Si no hay suscripción, asume plan Free (límite 3)
- Si `habitsMax` es `null`, permite hábitos ilimitados
- Solo valida al **crear**, no al actualizar o restaurar

## API Endpoints

Base URL: `/v1/habits`

### Endpoints CRUD

```
POST   /                  Crear hábito
GET    /                  Listar hábitos (paginado)
GET    /:id               Obtener hábito
PATCH  /:id               Actualizar hábito
DELETE /:id               Eliminar hábito (soft delete)
```

### Endpoints de Estado

```
POST   /:id/restore       Restaurar hábito eliminado
POST   /:id/pause         Pausar hábito
POST   /:id/reactivate    Reactivar hábito pausado
POST   /:id/block         Bloquear hábito
POST   /:id/unblock       Desbloquear hábito
```

### Endpoint de Búsqueda

```
GET    /search-key        Obtener Secured API Key para Algolia
```

## Integración con Algolia

El módulo sincroniza automáticamente con Algolia para búsqueda full-text en el frontend.

### Configuración

Variables de entorno requeridas:

```env
ALGOLIA_APP_ID=your_app_id
ALGOLIA_PRIVATE_KEY=your_admin_api_key
```

### Sincronización Automática

Los siguientes use cases sincronizan con Algolia:

| Use Case              | Operación Algolia                     |
| --------------------- | ------------------------------------- |
| `CreateHabitUseCase`  | `indexHabit()`                        |
| `UpdateHabitUseCase`  | `updateHabitIndex()`                  |
| `DeleteHabitUseCase`  | `updateHabitIndex()` (isActive=false) |
| `RestoreHabitUseCase` | `updateHabitIndex()` (isActive=true)  |

### Estructura del Índice

Index name: `habits` (definido en `ALGOLIA_INDEX_NAMES.HABITS`)

```typescript
{
  objectID: string,        // ID del hábito
  userId: string,          // Para filtro de Secured API Key
  name: string,            // Searchable
  description: string,     // Searchable
  status: string,          // Facet
  isActive: boolean,       // Facet
  scheduleType: string,    // Facet
  timeOfDay: string,       // Facet
  goalUnit: string,
  goalPeriod: string,
  goalTarget: number,
  // ... timestamps
}
```

### Uso en Frontend

1. Obtener Secured API Key:

```typescript
const response = await api.get("/v1/habits/search-key");
const { apiKey, appId, indexName } = response.data;
```

2. Usar con InstantSearch:

```typescript
import { liteClient } from 'algoliasearch/lite';
import { InstantSearch } from 'react-instantsearch';

const searchClient = liteClient(appId, apiKey);

<InstantSearch searchClient={searchClient} indexName={indexName}>
  {/* Componentes de búsqueda */}
</InstantSearch>
```

La Secured API Key incluye filtro automático por `userId`, asegurando que cada usuario solo vea sus propios hábitos.

## Manejo de Errores

### Sincronización con Algolia

Los errores de Algolia no fallan la operación principal:

```typescript
if (this.searchProvider) {
  try {
    await this.searchProvider.indexHabit(habit);
  } catch (err) {
    console.error("Failed to index habit in search:", err);
  }
}
```

### Algolia No Configurado

- **CRUD normal**: Funciona sin Algolia
- **GET /search-key**: Retorna 503 `SearchProviderNotConfiguredError`

## Dependencias

### Ports (Interfaces)

| Port                   | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `IHabitRepository`     | Persistencia de hábitos                  |
| `IHabitSearchProvider` | Proveedor de búsqueda (Algolia)          |
| `IHabitLimitChecker`   | Verificación de límite de hábitos (plan) |

### Adapters (Implementaciones)

| Adapter                      | Implementa             |
| ---------------------------- | ---------------------- |
| `HabitPostgresRepository`    | `IHabitRepository`     |
| `AlgoliaHabitSearchProvider` | `IHabitSearchProvider` |
| `HabitLimitChecker`          | `IHabitLimitChecker`   |

**Dependencias externas:**

- `plan-module` - Requerido para validar límites de hábitos (`getUserSubscription` use case)
- `algolia` - Opcional para búsqueda (puede operar sin él)

## Tests

Ubicación: `apps/api/test/habit/`

```bash
# Ejecutar tests del módulo
npm -C apps/api test -- --run test/habit
```

Los tests mockean el repositorio a nivel de port, no dentro del dominio.

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
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(command: MyCommand): Promise<Result> {
    // Lógica
  }
}
```

3. Registrar en `infrastructure/habit.module.ts`
4. Agregar método en controller y ruta

### Agregar Nuevo Proveedor de Búsqueda

1. Implementar `IHabitSearchProvider`
2. Crear factory o modificar plugin para seleccionar proveedor

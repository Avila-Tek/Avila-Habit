# Auth Module - Frontend Integration Guide

Este documento describe cómo integrar el sistema de autenticación desde el frontend.

## Changelog

### 2026-01-30: Sistema de Roles y Permisos

Se ha implementado un sistema completo de RBAC (Role-Based Access Control) con soporte para múltiples roles y permisos granulares.

**Roles Iniciales:**

- `USER` - Usuario regular con permisos básicos
- `ADMIN` - Administrador con acceso completo

**Nuevo en Current User Response:**

```json
{
  "role": {
    "id": "uuid",
    "code": "ADMIN",
    "name": "Administrator",
    "permissions": ["user:read:any", "admin:access", "admin:full"]
  }
}
```

**Middlewares de Autorización:**

- `requirePermission({ permissionCode })` - Verifica permiso específico
- `requireRole({ roleCode })` - Verifica rol específico
- `requireAnyPermission([codes])` - Verifica cualquiera de los permisos

### 2026-01-27: Cambio de `name` a `firstName` y `lastName`

El campo `name` ha sido reemplazado por `firstName` y `lastName` en todos los endpoints de autenticación.

**Sign Up Request:**

```json
// Antes
{ "name": "Juan Pérez" }

// Ahora
{ "firstName": "Juan", "lastName": "Pérez" }
```

**User Response:**

```json
// Antes
{ "name": "Juan Pérez" }

// Ahora
{ "firstName": "Juan", "lastName": "Pérez" }
```

> **Nota:** El endpoint `/api/auth/get-session` de Better Auth (usado en Google OAuth) aún devuelve `name` ya que es manejado directamente por Better Auth. Los endpoints personalizados (`/api/v1/auth/*`) usan `firstName` y `lastName`.

---

## Base URL

```
http://localhost:3000/api/v1/auth
```

---

## Endpoints

### 1. Sign Up (Registro)

Crea una nueva cuenta de usuario.

```http
POST /api/v1/auth/sign-up
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com",
  "password": "miPassword123",
  "rePassword": "miPassword123",
  "firstName": "Juan", // opcional
  "lastName": "Pérez" // opcional
}
```

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "data": {
    "user": null,
    "requiresEmailConfirmation": true
  }
}
```

> **Nota:** El usuario debe verificar su email antes de poder iniciar sesión.

---

### 2. Send OTP (Enviar código de verificación)

Envía un código OTP de 6 dígitos al email del usuario.

```http
POST /api/v1/auth/send-otp
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true
}
```

---

### 3. Verify OTP (Verificar email)

Verifica el email del usuario con el código OTP recibido.

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com",
  "otp": "123456"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "timezone": "America/New_York",
      "status": "Active",
      "createdAt": "2026-01-24T00:00:00.000Z",
      "updatedAt": "2026-01-24T00:00:00.000Z"
    },
    "accessToken": "token_aqui",
    "refreshToken": "refresh_token_aqui"
  }
}
```

---

### 4. Sign In (Iniciar sesión)

Inicia sesión con email y contraseña.

```http
POST /api/v1/auth/sign-in
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "usuario@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "timezone": "America/New_York",
      "status": "Active",
      "createdAt": "2026-01-24T00:00:00.000Z",
      "updatedAt": "2026-01-24T00:00:00.000Z"
    },
    "accessToken": "token_aqui",
    "refreshToken": "refresh_token_aqui"
  }
}
```

---

### 5. Current User (Usuario actual)

Obtiene los datos del usuario autenticado.

```http
GET /api/v1/auth/current-user
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "usuario@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "timezone": "America/New_York",
    "status": "Active",
    "role": {
      "id": "uuid-role",
      "code": "USER",
      "name": "User",
      "permissions": ["user:read:own", "habit:create", "plan:read"]
    },
    "subscription": {
      "id": "uuid-subscription",
      "status": "active",
      "isFree": true,
      "plan": { ... }
    },
    "createdAt": "2026-01-24T00:00:00.000Z",
    "updatedAt": "2026-01-24T00:00:00.000Z"
  }
}
```

---

### 6. Sign Out (Cerrar sesión)

Cierra la sesión del usuario.

```http
POST /api/v1/auth/sign-out
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": null
}
```

---

### 7. Forgot Password (Olvidé mi contraseña)

Envía un código OTP para restablecer la contraseña.

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true
}
```

> El usuario recibirá un código OTP de 6 dígitos en su email. Expira en 10 minutos.

---

### 8. Reset Password (Restablecer contraseña)

Restablece la contraseña usando el código OTP.

```http
POST /api/v1/auth/reset-password
Content-Type: application/json
```

**Body:**

```json
{
  "email": "usuario@example.com",
  "otp": "123456",
  "newPassword": "miNuevaPassword123"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true
}
```

---

## Google OAuth

### Flujo de autenticación con Google

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │   Google    │     │  Frontend   │
│  (Botón)    │     │             │     │             │     │ (Callback)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Click "Login   │                   │                   │
       │    con Google"    │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │ 2. Redirect 302   │                   │                   │
       │<──────────────────│                   │                   │
       │                   │                   │                   │
       │ 3. Redirect a Google ─────────────────>                   │
       │                   │                   │                   │
       │                   │    4. Usuario se  │                   │
       │                   │       autentica   │                   │
       │                   │                   │                   │
       │                   │<── 5. Callback ───│                   │
       │                   │    con código     │                   │
       │                   │                   │                   │
       │                   │ 6. Crea sesión    │                   │
       │                   │    + cookies      │                   │
       │                   │                   │                   │
       │                   │────────────────────────────────────────>
       │                   │ 7. Redirect a callbackUrl              │
       │                   │                   │                   │
       │                   │                   │    8. Obtener     │
       │                   │<───────────────────────────────────────│
       │                   │    GET /api/auth/get-session          │
       │                   │                   │                   │
       │                   │─────────────────────────────────────────>
       │                   │    9. { session, user }               │
       └───────────────────┴───────────────────┴───────────────────┘
```

### Paso 1: Botón de Google

En tu frontend, crea un botón que redirija al endpoint de Google OAuth:

```tsx
// React/Next.js
const handleGoogleLogin = () => {
  const callbackUrl = encodeURIComponent("http://localhost:3001/auth/callback");
  window.location.href = `http://localhost:3000/api/v1/auth/google?callbackUrl=${callbackUrl}`;
};

// En el JSX
<button onClick={handleGoogleLogin}>Continuar con Google</button>;
```

O simplemente un link:

```html
<a
  href="http://localhost:3000/api/v1/auth/google?callbackUrl=http://localhost:3001/auth/callback"
>
  Continuar con Google
</a>
```

### Paso 2: Página de Callback

Después de autenticarse con Google, el usuario será redirigido a tu `callbackUrl`. En esa página, debes obtener la sesión:

```tsx
// pages/auth/callback.tsx (Next.js) o equivalente

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/auth/get-session",
          {
            credentials: "include", // MUY IMPORTANTE para enviar cookies
          },
        );

        const data = await response.json();

        if (data?.session && data?.user) {
          // Guardar el token en localStorage o estado global
          localStorage.setItem("accessToken", data.session.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // Redirigir al dashboard o página principal
          router.push("/dashboard");
        } else {
          setError("No se pudo obtener la sesión");
        }
      } catch (err) {
        setError("Error al obtener la sesión");
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, [router]);

  if (loading) {
    return <div>Autenticando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return null;
}
```

### Respuesta de get-session

```http
GET /api/auth/get-session
Cookie: better-auth.session_token=...
```

**Respuesta:**

```json
{
  "session": {
    "token": "9GL4RKbAyOjlvdr8LGFLeOg0bB7Qhkud",
    "expiresAt": "2026-02-02T12:46:00.386Z",
    "userId": "99525e04-e2f0-4bc2-85e5-0340d9248fcd",
    "id": "6d8ab877-5938-4e03-924d-a9a392fe9798",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2026-01-26T12:46:00.386Z",
    "updatedAt": "2026-01-26T12:46:00.386Z"
  },
  "user": {
    "id": "99525e04-e2f0-4bc2-85e5-0340d9248fcd",
    "name": "Jose Elias",
    "email": "joseeli12345@gmail.com",
    "emailVerified": true,
    "createdAt": "2026-01-23T03:49:00.735Z",
    "updatedAt": "2026-01-23T03:49:39.811Z"
  }
}
```

**El token para usar en Authorization es:** `session.token`

> **Nota:** Este endpoint es manejado directamente por Better Auth, por lo que devuelve `name` en lugar de `firstName`/`lastName`. Si necesitas `firstName` y `lastName`, usa el endpoint `/api/v1/auth/current-user` con el token obtenido.

---

## Uso del Token

Una vez obtenido el token (ya sea por sign-in normal o Google OAuth), úsalo en todas las peticiones autenticadas:

```tsx
// Ejemplo de petición autenticada
const response = await fetch("http://localhost:3000/api/v1/users/me", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});
```

---

## Flujos Completos

### Flujo de Registro

```
1. POST /sign-up          → Usuario se registra
2. POST /send-otp         → Se envía código al email
3. POST /verify-otp       → Usuario verifica email → Recibe tokens
4. Guardar tokens         → Usuario autenticado
```

### Flujo de Login Normal

```
1. POST /sign-in          → Usuario ingresa credenciales → Recibe tokens
2. Guardar tokens         → Usuario autenticado
```

### Flujo de Login con Google

```
1. GET /google            → Redirige a Google
2. Usuario se autentica   → Google redirige al callback del backend
3. Backend redirige       → Al callbackUrl del frontend
4. GET /api/auth/get-session → Obtener token y usuario
5. Guardar tokens         → Usuario autenticado
```

### Flujo de Recuperar Contraseña

```
1. POST /forgot-password  → Se envía código OTP al email
2. POST /reset-password   → Usuario ingresa OTP + nueva contraseña
3. POST /sign-in          → Usuario inicia sesión con nueva contraseña
```

---

## Errores Comunes

| Código | Mensaje                | Causa                                |
| ------ | ---------------------- | ------------------------------------ |
| 400    | Invalid credentials    | Email o contraseña incorrectos       |
| 400    | Email not confirmed    | El usuario no ha verificado su email |
| 400    | Invalid or expired OTP | El código OTP es incorrecto o expiró |
| 401    | Unauthorized           | Token inválido o expirado            |
| 404    | User not found         | El email no está registrado          |

---

## Configuración CORS

Para que `credentials: 'include'` funcione, asegúrate de que tu frontend esté en la lista de orígenes permitidos del backend.

En el `.env` del backend:

```
CORS_ORIGINS=["http://localhost:3001", "http://localhost:3002"]
```

---

## Variables de Entorno (Frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_CALLBACK_URL=http://localhost:3001/auth/callback
```

---

## Resumen de Endpoints

| Endpoint                       | Método | Auth   | Descripción                   |
| ------------------------------ | ------ | ------ | ----------------------------- |
| `/api/v1/auth/sign-up`         | POST   | No     | Registrar usuario             |
| `/api/v1/auth/sign-in`         | POST   | No     | Iniciar sesión                |
| `/api/v1/auth/sign-out`        | POST   | Sí     | Cerrar sesión                 |
| `/api/v1/auth/current-user`    | GET    | Sí     | Obtener usuario actual        |
| `/api/v1/auth/send-otp`        | POST   | No     | Enviar código OTP             |
| `/api/v1/auth/verify-otp`      | POST   | No     | Verificar email con OTP       |
| `/api/v1/auth/forgot-password` | POST   | No     | Solicitar reset de password   |
| `/api/v1/auth/reset-password`  | POST   | No     | Resetear password con OTP     |
| `/api/v1/auth/google`          | GET    | No     | Iniciar OAuth con Google      |
| `/api/auth/get-session`        | GET    | Cookie | Obtener sesión (Google OAuth) |

---

## Sistema de Roles y Permisos (RBAC)

El sistema implementa un control de acceso basado en roles (RBAC) con permisos granulares.

### Roles Disponibles

| Código  | Nombre        | Descripción                                  |
| ------- | ------------- | -------------------------------------------- |
| `USER`  | User          | Usuario regular con permisos básicos         |
| `ADMIN` | Administrator | Administrador con acceso completo al sistema |

### Formato de Permisos

Los permisos siguen el formato: `recurso:accion` o `recurso:accion:alcance`

**Ejemplos:**

- `user:read:own` - Leer datos propios del usuario
- `user:read:any` - Leer datos de cualquier usuario (admin)
- `habit:create` - Crear hábitos
- `admin:access` - Acceder al panel de administración

### Permisos por Rol

**USER (Usuario Regular):**

- `user:read:own`, `user:update:own`, `user:delete:own`
- `habit:create`, `habit:read:own`, `habit:update:own`, `habit:delete:own`
- `plan:read`

**ADMIN (Administrador):**

- Todos los permisos de USER
- `user:create`, `user:read:any`, `user:update:any`, `user:delete:any`, `user:admin:create`
- `habit:read:any`
- `plan:manage`, `subscription:manage`
- `admin:access`, `admin:full`

### Current User con Role

El endpoint `/api/v1/auth/current-user` ahora incluye información del rol:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "timezone": "America/New_York",
    "status": "Active",
    "role": {
      "id": "uuid-role",
      "code": "ADMIN",
      "name": "Administrator",
      "permissions": [
        "user:read:any",
        "user:admin:create",
        "admin:access",
        "admin:full"
      ]
    },
    "subscription": { ... },
    "createdAt": "2026-01-24T00:00:00.000Z",
    "updatedAt": "2026-01-24T00:00:00.000Z"
  }
}
```

### Uso en Frontend

**Verificar si tiene permiso:**

```typescript
const hasPermission = user.role?.permissions.includes("admin:access");
```

**Verificar si es admin:**

```typescript
const isAdmin = user.role?.code === "ADMIN";
```

**Guard para rutas protegidas:**

```typescript
// React Router example
<Route
  path="/admin/*"
  element={user?.role?.code === 'ADMIN' ? <AdminPanel /> : <Navigate to="/" />}
/>
```

---

## Backend: Middlewares de Autorización

Los siguientes middlewares están disponibles para proteger rutas:

### 1. requirePermission

Verifica que el usuario tenga un permiso específico.

```typescript
import { requirePermission } from "@/plugins/routes/middlewares/permissions.middleware";

fastify.get(
  "/admin/users",
  {
    preHandler: requirePermission({ permissionCode: "user:read:any" }),
  },
  handler,
);
```

### 2. requireRole

Verifica que el usuario tenga un rol específico.

```typescript
fastify.get(
  "/admin/dashboard",
  {
    preHandler: requireRole({ roleCode: "ADMIN" }),
  },
  handler,
);
```

### 3. requireAnyPermission

Verifica que el usuario tenga cualquiera de los permisos especificados.

```typescript
fastify.post(
  "/users",
  {
    preHandler: requireAnyPermission(["user:create", "user:admin:create"]),
  },
  handler,
);
```

### Respuesta 403 (Forbidden)

Si el usuario no tiene el permiso requerido:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Permission denied: user:read:any"
  }
}
```

---

## Setup: Seed de Roles y Permisos

Para inicializar los roles y permisos en la base de datos:

### 1. Crear migración de base de datos

```bash
cd apps/api
npm run db:generate
```

### 2. Ejecutar seed de roles

```bash
cd apps/api
npm run db:seed:roles
```

Este comando creará:

- Todos los permisos definidos en `src/database/roles/roles.seed.ts`
- Los roles USER y ADMIN
- Las relaciones entre roles y permisos

**Nota:** El seed es idempotente - puede ejecutarse múltiples veces sin duplicar datos.

### 3. Asignar rol a usuario existente

Para convertir un usuario existente en admin, ejecuta en SQL:

```sql
-- Obtener ID del rol ADMIN
SELECT id FROM roles WHERE code = 'ADMIN';

-- Asignar rol al usuario
UPDATE "User"
SET role_id = '[ID_DEL_ROL_ADMIN]'
WHERE email = 'admin@example.com';
```

---

## Agregar Nuevos Permisos

Para agregar nuevos permisos al sistema:

1. Editar `src/database/roles/roles.seed.ts`
2. Agregar el permiso al array `initialPermissions`:

```typescript
const initialPermissions = [
  // ... permisos existentes
  {
    code: "new:feature:action",
    name: "New Feature Action",
    description: "Descripción del permiso",
  },
];
```

3. Asignar a roles en `roleDefinitions`:

```typescript
const roleDefinitions = [
  {
    code: "ADMIN",
    permissions: [
      // ... permisos existentes
      "new:feature:action",
    ],
  },
];
```

4. Ejecutar nuevamente el seed:

```bash
npm run db:seed:roles
```

---

## Arquitectura del Sistema de Roles

```
auth/
├── domain/
│   ├── entities/
│   │   ├── PermissionEntity.ts    # Entidad Permission
│   │   └── RoleEntity.ts          # Entidad Role con permissions[]
│   └── value-objects/
│       └── PermissionCode.ts      # VO con validación de formato
├── application/
│   ├── ports/
│   │   ├── permissionRepository.port.ts
│   │   └── roleRepository.port.ts
│   └── services/
│       └── authorization.service.ts  # Lógica de verificación
└── infrastructure/
    └── persistent/
        ├── PermissionPostgresRepository.ts
        └── RolePostgresRepository.ts

database/
├── roles/
│   ├── roles.schema.ts            # Tablas: roles, permissions, role_permissions
│   └── roles.seed.ts              # Datos iniciales
└── user/
    └── user.schema.ts             # Campo role_id en users
```

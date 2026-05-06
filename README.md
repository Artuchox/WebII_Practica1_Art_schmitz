# WebII Práctica Final — API de Gestión de Albaranes

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios, clientes, proyectos y albaranes digitales con firma y generación de PDF.

---

## Tecnologías

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **Base de datos:** MongoDB + Mongoose
- **Autenticación:** JWT (access token + refresh token)
- **Almacenamiento:** Cloudinary (imágenes de firma y PDFs)
- **Tiempo real:** Socket.IO
- **Validación:** Zod
- **Tests:** Jest + Supertest + mongodb-memory-server
- **Documentación:** Swagger UI
- **Contenedores:** Docker + Docker Compose

---

## Instalación

```bash
git clone <url-del-repositorio>
cd webiipracticai
npm install
```

Copia el archivo de ejemplo de variables de entorno y rellena los valores:

```bash
cp .env.example .env
```

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | Entorno (`development`, `production`, `test`) |
| `PORT` | Puerto del servidor |
| `DB_URI` | URI de conexión a MongoDB Atlas |
| `JWT_SECRET` | Secreto para firmar access tokens |
| `JWT_EXPIRES_IN` | Expiración del access token |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token |
| `SLACK_WEBHOOK` | URL del webhook de Slack para notificaciones |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `MAIL_HOST` | Host del servidor SMTP |
| `MAIL_PORT` | Puerto SMTP |
| `MAIL_USER` | Usuario del email |
| `MAIL_PASS` | Contraseña del email |

---

## Scripts

```bash
npm run dev          # Servidor en modo desarrollo con hot reload
npm start            # Servidor en modo producción
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con informe de cobertura
```

---

## Estructura del proyecto

```
src/
├── config/          # Configuración (env, cloudinary, swagger, database)
├── controllers/     # Lógica de negocio
├── middleware/       # Auth, validación, rate limit, roles, sanitización
├── models/          # Schemas de Mongoose
├── routes/          # Definición de endpoints
├── services/        # Servicios externos (mail, pdf, storage, logger)
├── utils/           # AppError
└── validators/      # Schemas Zod
tests/
├── setup.js         # Configuración de mongodb-memory-server
├── auth.test.js
├── client.test.js
├── project.test.js
└── deliverynote.test.js
```

---

## Endpoints principales

### Usuarios — `/api/user`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/register` | Registrar usuario | No |
| POST | `/login` | Iniciar sesión | No |
| PUT | `/validation` | Verificar email | Sí |
| GET | `/` | Obtener perfil | Sí |
| PUT | `/register` | Actualizar datos personales | Sí |
| PATCH | `/company` | Crear/unirse a compañía | Sí |
| PATCH | `/logo` | Subir logo de compañía | Sí |
| PUT | `/password` | Cambiar contraseña | Sí |
| POST | `/refresh` | Renovar token | No |
| POST | `/logout` | Cerrar sesión | Sí |
| DELETE | `/` | Eliminar cuenta | Sí |
| POST | `/invite` | Invitar usuario (admin) | Sí |

### Clientes — `/api/client`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear cliente | Sí |
| GET | `/` | Listar clientes | Sí |
| GET | `/archived` | Listar archivados | Sí |
| GET | `/:id` | Obtener cliente | Sí |
| PUT | `/:id` | Actualizar cliente | Sí |
| DELETE | `/:id` | Eliminar cliente | Sí |
| PATCH | `/:id/restore` | Restaurar cliente | Sí |

### Proyectos — `/api/project`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear proyecto | Sí |
| GET | `/` | Listar proyectos | Sí |
| GET | `/archived` | Listar archivados | Sí |
| GET | `/:id` | Obtener proyecto | Sí |
| PUT | `/:id` | Actualizar proyecto | Sí |
| DELETE | `/:id` | Eliminar proyecto | Sí |
| PATCH | `/:id/restore` | Restaurar proyecto | Sí |

### Albaranes — `/api/deliverynote`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/` | Crear albarán | Sí |
| GET | `/` | Listar albaranes | Sí |
| GET | `/:id` | Obtener albarán | Sí |
| PUT | `/:id` | Actualizar albarán | Sí |
| DELETE | `/:id` | Eliminar albarán | Sí |
| PATCH | `/:id/sign` | Firmar albarán con imagen | Sí |
| GET | `/:id/pdf` | Descargar PDF firmado | Sí |

---

## Documentación Swagger

Con el servidor arrancado, visita:

```
http://localhost:3000/api-docs
```

---

## Health Check

```
GET /api/health
```

```json
{
  "status": "ok",
  "db": "connected",
  "uptime": 123.45,
  "timestamp": "2026-05-06T12:00:00.000Z"
}
```

---

## Tests y cobertura

![Cobertura de tests](./test-coverage.png)

| Métrica | Resultado |
|---------|-----------|
| Statements | 82.52% |
| Branch | 70.46% |
| Functions | 90.9% |
| Lines | 85.74% |
| Test Suites | 5 passed |
| Tests | 71 passed |

```bash
npm run test:coverage
```

---

## Docker

### Desarrollo con Docker Compose

```bash
docker compose up --build
```

Levanta la API en el puerto `3000` y una instancia local de MongoDB en el `27017`.

### Imagen de producción

```bash
docker build -t webiipracticai .
docker run -p 3000:3000 --env-file .env webiipracticai
```

---

## Socket.IO

La API emite eventos en tiempo real a los usuarios de la misma compañía:

| Evento | Descripción |
|--------|-------------|
| `deliverynote:created` | Se ha creado un nuevo albarán |
| `deliverynote:signed` | Un albarán ha sido firmado |

Desde el cliente, únete a la sala de tu compañía:

```javascript
socket.emit('join:company', companyId)
socket.on('deliverynote:created', ({ deliveryNote }) => { ... })
socket.on('deliverynote:signed', ({ deliveryNote }) => { ... })
```

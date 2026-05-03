// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Tracks - Express con Swagger',
      version: '1.0.0',
      description: 'API REST documentada con Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      },
      contact: {
        name: 'Tu Nombre',
        email: 'tu@email.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error:   { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Mensaje de error' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            street:   { type: 'string', example: 'Calle Mayor' },
            number:   { type: 'string', example: '10' },
            postal:   { type: 'string', example: '28001' },
            city:     { type: 'string', example: 'Madrid' },
            province: { type: 'string', example: 'Madrid' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            _id:     { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name:    { type: 'string', example: 'Cliente S.L.' },
            cif:     { type: 'string', example: 'B12345678' },
            email:   { type: 'string', example: 'cliente@ejemplo.com' },
            phone:   { type: 'string', example: '600000000' },
            address: { '$ref': '#/components/schemas/Address' },
            deleted: { type: 'boolean', example: false }
          }
        },
        ClientInput: {
          type: 'object',
          required: ['name', 'cif'],
          properties: {
            name:    { type: 'string', example: 'Cliente S.L.' },
            cif:     { type: 'string', example: 'B12345678' },
            email:   { type: 'string', example: 'cliente@ejemplo.com' },
            phone:   { type: 'string', example: '600000000' },
            address: { '$ref': '#/components/schemas/Address' }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id:         { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name:        { type: 'string', example: 'Proyecto Reforma' },
            projectCode: { type: 'string', example: 'PRJ-001' },
            client:      { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            address:     { '$ref': '#/components/schemas/Address' },
            email:       { type: 'string', example: 'proyecto@ejemplo.com' },
            notes:       { type: 'string', example: 'Notas del proyecto' },
            active:      { type: 'boolean', example: true },
            deleted:     { type: 'boolean', example: false }
          }
        },
        ProjectInput: {
          type: 'object',
          required: ['name', 'projectCode', 'client'],
          properties: {
            name:        { type: 'string', example: 'Proyecto Reforma' },
            projectCode: { type: 'string', example: 'PRJ-001' },
            client:      { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            address:     { '$ref': '#/components/schemas/Address' },
            email:       { type: 'string', example: 'proyecto@ejemplo.com' },
            notes:       { type: 'string', example: 'Notas del proyecto' }
          }
        },
        DeliveryNote: {
          type: 'object',
          properties: {
            _id:          { type: 'string',  example: '65f8b3a2c9d1e20012345678' },
            client:       { type: 'string',  example: '65f8b3a2c9d1e20012345678' },
            project:      { type: 'string',  example: '65f8b3a2c9d1e20012345678' },
            format:       { type: 'string',  enum: ['material', 'hours'] },
            description:  { type: 'string',  example: 'Trabajo realizado' },
            workDate:     { type: 'string',  format: 'date-time' },
            material:     { type: 'string',  example: 'Cemento' },
            quantity:     { type: 'number',  example: 10 },
            unit:         { type: 'string',  example: 'sacos' },
            hours:        { type: 'number',  example: 8 },
            workers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name:  { type: 'string', example: 'Juan' },
                  hours: { type: 'number', example: 4 }
                }
              }
            },
            signed:       { type: 'boolean', example: false },
            signedAt:     { type: 'string',  format: 'date-time' },
            signatureUrl: { type: 'string',  example: 'https://cloudinary.com/...' },
            pdfUrl:       { type: 'string',  example: 'https://cloudinary.com/...' },
            deleted:      { type: 'boolean', example: false }
          }
        },
        DeliveryNoteInput: {
          type: 'object',
          required: ['client', 'project', 'format', 'workDate'],
          properties: {
            client:      { type: 'string',  example: '65f8b3a2c9d1e20012345678' },
            project:     { type: 'string',  example: '65f8b3a2c9d1e20012345678' },
            format:      { type: 'string',  enum: ['material', 'hours'] },
            description: { type: 'string',  example: 'Trabajo realizado' },
            workDate:    { type: 'string',  format: 'date-time' },
            material:    { type: 'string',  example: 'Cemento' },
            quantity:    { type: 'number',  example: 10 },
            unit:        { type: 'string',  example: 'sacos' },
            hours:       { type: 'number',  example: 8 },
            workers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name:  { type: 'string', example: 'Juan' },
                  hours: { type: 'number', example: 4 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/client': {
        get: {
          tags: ['Clients'],
          summary: 'Listar clientes',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',  schema: { type: 'integer' }, example: 1 },
            { in: 'query', name: 'limit', schema: { type: 'integer' }, example: 10 },
            { in: 'query', name: 'name',  schema: { type: 'string'  } },
            { in: 'query', name: 'sort',  schema: { type: 'string'  }, example: 'createdAt' }
          ],
          responses: {
            200: { description: 'Lista de clientes', content: { 'application/json': { schema: { type: 'object', properties: { clients: { type: 'array', items: { '$ref': '#/components/schemas/Client' } }, totalItems: { type: 'integer' }, currentPage: { type: 'integer' }, totalPages: { type: 'integer' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        post: {
          tags: ['Clients'],
          summary: 'Crear cliente',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/ClientInput' } } } },
          responses: {
            201: { description: 'Cliente creado',    content: { 'application/json': { schema: { type: 'object', properties: { client: { '$ref': '#/components/schemas/Client' } } } } } },
            400: { description: 'Datos invalidos',   content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',     content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            409: { description: 'CIF duplicado',     content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/client/archived': {
        get: {
          tags: ['Clients'],
          summary: 'Listar clientes archivados',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de clientes archivados', content: { 'application/json': { schema: { type: 'object', properties: { clients: { type: 'array', items: { '$ref': '#/components/schemas/Client' } } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/client/{id}': {
        get: {
          tags: ['Clients'],
          summary: 'Obtener cliente por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Cliente encontrado', content: { 'application/json': { schema: { type: 'object', properties: { client: { '$ref': '#/components/schemas/Client' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['Clients'],
          summary: 'Actualizar cliente',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/ClientInput' } } } },
          responses: {
            200: { description: 'Cliente actualizado', content: { 'application/json': { schema: { type: 'object', properties: { client: { '$ref': '#/components/schemas/Client' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Clients'],
          summary: 'Eliminar cliente (soft o hard)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path',  name: 'id',   required: true, schema: { type: 'string' } },
            { in: 'query', name: 'soft', schema: { type: 'boolean' }, example: true }
          ],
          responses: {
            200: { description: 'Cliente eliminado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/client/{id}/restore': {
        patch: {
          tags: ['Clients'],
          summary: 'Restaurar cliente archivado',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Cliente restaurado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/project': {
        get: {
          tags: ['Projects'],
          summary: 'Listar proyectos',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',   schema: { type: 'integer' }, example: 1 },
            { in: 'query', name: 'limit',  schema: { type: 'integer' }, example: 10 },
            { in: 'query', name: 'name',   schema: { type: 'string'  } },
            { in: 'query', name: 'client', schema: { type: 'string'  } },
            { in: 'query', name: 'sort',   schema: { type: 'string'  }, example: 'createdAt' }
          ],
          responses: {
            200: { description: 'Lista de proyectos', content: { 'application/json': { schema: { type: 'object', properties: { projects: { type: 'array', items: { '$ref': '#/components/schemas/Project' } }, totalItems: { type: 'integer' }, currentPage: { type: 'integer' }, totalPages: { type: 'integer' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        post: {
          tags: ['Projects'],
          summary: 'Crear proyecto',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/ProjectInput' } } } },
          responses: {
            201: { description: 'Proyecto creado',   content: { 'application/json': { schema: { type: 'object', properties: { project: { '$ref': '#/components/schemas/Project' } } } } } },
            400: { description: 'Datos invalidos',   content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',     content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            409: { description: 'Codigo duplicado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/project/archived': {
        get: {
          tags: ['Projects'],
          summary: 'Listar proyectos archivados',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de proyectos archivados', content: { 'application/json': { schema: { type: 'object', properties: { projects: { type: 'array', items: { '$ref': '#/components/schemas/Project' } } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/project/{id}': {
        get: {
          tags: ['Projects'],
          summary: 'Obtener proyecto por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Proyecto encontrado', content: { 'application/json': { schema: { type: 'object', properties: { project: { '$ref': '#/components/schemas/Project' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['Projects'],
          summary: 'Actualizar proyecto',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/ProjectInput' } } } },
          responses: {
            200: { description: 'Proyecto actualizado', content: { 'application/json': { schema: { type: 'object', properties: { project: { '$ref': '#/components/schemas/Project' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Projects'],
          summary: 'Eliminar proyecto (soft o hard)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path',  name: 'id',   required: true, schema: { type: 'string' } },
            { in: 'query', name: 'soft', schema: { type: 'boolean' }, example: true }
          ],
          responses: {
            200: { description: 'Proyecto eliminado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/project/{id}/restore': {
        patch: {
          tags: ['Projects'],
          summary: 'Restaurar proyecto archivado',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Proyecto restaurado' },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/deliverynote': {
        get: {
          tags: ['DeliveryNotes'],
          summary: 'Listar albaranes',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'page',    schema: { type: 'integer' }, example: 1 },
            { in: 'query', name: 'limit',   schema: { type: 'integer' }, example: 10 },
            { in: 'query', name: 'client',  schema: { type: 'string'  } },
            { in: 'query', name: 'project', schema: { type: 'string'  } },
            { in: 'query', name: 'format',  schema: { type: 'string', enum: ['material', 'hours'] } },
            { in: 'query', name: 'signed',  schema: { type: 'boolean' } }
          ],
          responses: {
            200: { description: 'Lista de albaranes', content: { 'application/json': { schema: { type: 'object', properties: { deliveryNotes: { type: 'array', items: { '$ref': '#/components/schemas/DeliveryNote' } }, totalItems: { type: 'integer' }, currentPage: { type: 'integer' }, totalPages: { type: 'integer' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        post: {
          tags: ['DeliveryNotes'],
          summary: 'Crear albaran',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/DeliveryNoteInput' } } } },
          responses: {
            201: { description: 'Albaran creado',   content: { 'application/json': { schema: { type: 'object', properties: { deliveryNote: { '$ref': '#/components/schemas/DeliveryNote' } } } } } },
            400: { description: 'Datos invalidos',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',    content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'Cliente o proyecto no encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/deliverynote/{id}': {
        get: {
          tags: ['DeliveryNotes'],
          summary: 'Obtener albaran por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Albaran encontrado', content: { 'application/json': { schema: { type: 'object', properties: { deliveryNote: { '$ref': '#/components/schemas/DeliveryNote' } } } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['DeliveryNotes'],
          summary: 'Actualizar albaran (solo si no esta firmado)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/DeliveryNoteInput' } } } },
          responses: {
            200: { description: 'Albaran actualizado', content: { 'application/json': { schema: { type: 'object', properties: { deliveryNote: { '$ref': '#/components/schemas/DeliveryNote' } } } } } },
            400: { description: 'Albaran firmado o datos invalidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',  content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['DeliveryNotes'],
          summary: 'Eliminar albaran (solo si no esta firmado)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path',  name: 'id',   required: true, schema: { type: 'string' } },
            { in: 'query', name: 'soft', schema: { type: 'boolean' }, example: true }
          ],
          responses: {
            200: { description: 'Albaran eliminado' },
            400: { description: 'Albaran firmado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',   content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',   content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/deliverynote/{id}/sign': {
        patch: {
          tags: ['DeliveryNotes'],
          summary: 'Firmar albaran con imagen',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['signature'],
                  properties: {
                    signature: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Albaran firmado', content: { 'application/json': { schema: { type: 'object', properties: { deliveryNote: { '$ref': '#/components/schemas/DeliveryNote' } } } } } },
            400: { description: 'Ya firmado o sin imagen', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',           content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',           content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/deliverynote/{id}/pdf': {
        get: {
          tags: ['DeliveryNotes'],
          summary: 'Descargar PDF del albaran firmado',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'PDF generado', content: { 'application/pdf': {} } },
            400: { description: 'Albaran no firmado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado',      content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
            404: { description: 'No encontrado',      content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);
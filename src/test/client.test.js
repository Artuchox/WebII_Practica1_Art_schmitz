// src/test/client.test.js
import request from 'supertest'
import app from '../app.js'

describe('Client Endpoints', () => {
  let token = ''
  let clientId = ''

  const testUser = {
    email: `client_test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  }

  const testClient = {
    name: 'Cliente Test S.L.',
    cif: `B${Date.now().toString().slice(-7)}`,
    email: 'cliente@test.com',
    phone: '600000000',
    address: {
      street: 'Calle Test',
      number: '1',
      postal: '28001',
      city: 'Madrid',
      province: 'Madrid'
    }
  }

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser)

    token = res.body.accessToken

    await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', lastName: 'User', nif: '12345678A' })

    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Empresa Test S.L.', cif: 'B12345678', isFreelance: false })
  })

  describe('POST /api/client', () => {
    it('debería crear un cliente correctamente', async () => {
      const res = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send(testClient)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(res.body).toHaveProperty('client')
      expect(res.body.client.name).toBe(testClient.name)
      expect(res.body.client.cif).toBe(testClient.cif)

      clientId = res.body.client._id
    })

    it('debería rechazar CIF duplicado en la misma compañía', async () => {
      const res = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send(testClient)
        .expect(409)

      expect(res.body.error).toBe(true)
    })

    it('debería rechazar sin autenticación', async () => {
      await request(app)
        .post('/api/client')
        .send(testClient)
        .expect(401)
    })

    it('debería rechazar sin nombre', async () => {
      await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ cif: 'B99999999' })
        .expect(400)
    })
  })

  describe('GET /api/client', () => {
    it('debería listar los clientes de la compañía', async () => {
      const res = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveProperty('clients')
      expect(Array.isArray(res.body.clients)).toBe(true)
      expect(res.body).toHaveProperty('totalItems')
    })

    it('debería rechazar sin autenticación', async () => {
      await request(app)
        .get('/api/client')
        .expect(401)
    })
  })

  describe('GET /api/client/:id', () => {
    it('debería obtener un cliente por ID', async () => {
      const res = await request(app)
        .get(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.client._id).toBe(clientId)
    })

    it('debería devolver 404 para ID inexistente', async () => {
      await request(app)
        .get('/api/client/65f8b3a2c9d1e20012345678')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })

  describe('PUT /api/client/:id', () => {
    it('debería actualizar un cliente', async () => {
      const res = await request(app)
        .put(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cliente Actualizado S.L.' })
        .expect(200)

      expect(res.body.client.name).toBe('Cliente Actualizado S.L.')
    })
  })

  describe('DELETE /api/client/:id (soft)', () => {
    it('debería archivar un cliente con soft delete', async () => {
      const res = await request(app)
        .delete(`/api/client/${clientId}?soft=true`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.message).toMatch(/soft/)
    })
  })

  describe('GET /api/client/archived', () => {
    it('debería listar los clientes archivados', async () => {
      const res = await request(app)
        .get('/api/client/archived')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(Array.isArray(res.body.clients)).toBe(true)
    })
  })

  describe('PATCH /api/client/:id/restore', () => {
    it('debería restaurar un cliente archivado', async () => {
      const res = await request(app)
        .patch(`/api/client/${clientId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.message).toMatch(/restaurado/)
    })
  })

  describe('DELETE /api/client/:id (hard)', () => {
    it('debería eliminar un cliente permanentemente', async () => {
      await request(app)
        .delete(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
})
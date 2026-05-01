// src/test/project.test.js
import request from 'supertest'
import app from '../app.js'

describe('Project Endpoints', () => {
  let token = ''
  let clientId = ''
  let projectId = ''

  const testUser = {
    email: `project_test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  }

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser)

    token = res.body.accessToken

    await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', lastName: 'User', nif: '12345678B' })

    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Empresa Proyectos S.L.', cif: 'B87654321', isFreelance: false })

    const clientRes = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Para Proyecto',
        cif: `A${Date.now().toString().slice(-7)}`
      })

    clientId = clientRes.body.client._id
  })

  describe('POST /api/project', () => {
    it('debería crear un proyecto correctamente', async () => {
      const res = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Proyecto Test',
          projectCode: `PRJ-${Date.now()}`,
          client: clientId
        })
        .expect('Content-Type', /json/)
        .expect(201)

      expect(res.body).toHaveProperty('project')
      expect(res.body.project.name).toBe('Proyecto Test')

      projectId = res.body.project._id
    })

    it('debería rechazar sin cliente', async () => {
      await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sin Cliente', projectCode: 'PRJ-000' })
        .expect(400)
    })

    it('debería rechazar sin autenticación', async () => {
      await request(app)
        .post('/api/project')
        .send({ name: 'Sin Auth', projectCode: 'PRJ-001', client: clientId })
        .expect(401)
    })
  })

  describe('GET /api/project', () => {
    it('debería listar los proyectos de la compañía', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveProperty('projects')
      expect(Array.isArray(res.body.projects)).toBe(true)
      expect(res.body).toHaveProperty('totalItems')
    })

    it('debería rechazar sin autenticación', async () => {
      await request(app)
        .get('/api/project')
        .expect(401)
    })
  })

  describe('GET /api/project/:id', () => {
    it('debería obtener un proyecto por ID', async () => {
      const res = await request(app)
        .get(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.project._id).toBe(projectId)
    })

    it('debería devolver 404 para ID inexistente', async () => {
      await request(app)
        .get('/api/project/65f8b3a2c9d1e20012345678')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })

  describe('PUT /api/project/:id', () => {
    it('debería actualizar un proyecto', async () => {
      const res = await request(app)
        .put(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Proyecto Actualizado' })
        .expect(200)

      expect(res.body.project.name).toBe('Proyecto Actualizado')
    })
  })

  describe('DELETE /api/project/:id (soft)', () => {
    it('debería archivar un proyecto con soft delete', async () => {
      const res = await request(app)
        .delete(`/api/project/${projectId}?soft=true`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.message).toMatch(/soft/)
    })
  })

  describe('GET /api/project/archived', () => {
    it('debería listar los proyectos archivados', async () => {
      const res = await request(app)
        .get('/api/project/archived')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(Array.isArray(res.body.projects)).toBe(true)
    })
  })

  describe('PATCH /api/project/:id/restore', () => {
    it('debería restaurar un proyecto archivado', async () => {
      const res = await request(app)
        .patch(`/api/project/${projectId}/restore`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.message).toMatch(/restaurado/)
    })
  })

  describe('DELETE /api/project/:id (hard)', () => {
    it('debería eliminar un proyecto permanentemente', async () => {
      await request(app)
        .delete(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
})
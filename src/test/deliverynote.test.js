// src/test/deliverynote.test.js
import request from 'supertest'
import app from '../app.js'

describe('DeliveryNote Endpoints', () => {
  let token = ''
  let clientId = ''
  let projectId = ''
  let deliveryNoteId = ''

  const testUser = {
    email: `dn_test_${Date.now()}@example.com`,
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
      .send({ name: 'Test', lastName: 'User', nif: '12345678C' })

    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Empresa Albaranes S.L.', cif: 'B11111111', isFreelance: false })

    const clientRes = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Albarán', cif: `C${Date.now().toString().slice(-7)}` })

    clientId = clientRes.body.client._id

    const projectRes = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto Albarán', projectCode: `DN-${Date.now()}`, client: clientId })

    projectId = projectRes.body.project._id
  })

  describe('POST /api/deliverynote', () => {
    it('debería crear un albarán de horas correctamente', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client:      clientId,
          project:     projectId,
          format:      'hours',
          workDate:    new Date().toISOString(),
          hours:       8,
          description: 'Trabajo de prueba'
        })
        .expect('Content-Type', /json/)
        .expect(201)

      expect(res.body).toHaveProperty('deliveryNote')
      expect(res.body.deliveryNote.format).toBe('hours')
      expect(res.body.deliveryNote.signed).toBe(false)

      deliveryNoteId = res.body.deliveryNote._id
    })

    it('debería crear un albarán de material correctamente', async () => {
      const res = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client:   clientId,
          project:  projectId,
          format:   'material',
          workDate: new Date().toISOString(),
          material: 'Cemento',
          quantity: 10,
          unit:     'sacos'
        })
        .expect(201)

      expect(res.body.deliveryNote.format).toBe('material')
    })

    it('debería rechazar albarán de material sin campos obligatorios', async () => {
      await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client:   clientId,
          project:  projectId,
          format:   'material',
          workDate: new Date().toISOString()
        })
        .expect(400)
    })

    it('debería rechazar sin autenticación', async () => {
      await request(app)
        .post('/api/deliverynote')
        .send({ client: clientId, project: projectId, format: 'hours', workDate: new Date(), hours: 4 })
        .expect(401)
    })
  })

  describe('GET /api/deliverynote', () => {
    it('debería listar los albaranes de la compañía', async () => {
      const res = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveProperty('deliveryNotes')
      expect(Array.isArray(res.body.deliveryNotes)).toBe(true)
      expect(res.body).toHaveProperty('totalItems')
    })

    it('debería filtrar por formato', async () => {
      const res = await request(app)
        .get('/api/deliverynote?format=hours')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      res.body.deliveryNotes.forEach(dn => {
        expect(dn.format).toBe('hours')
      })
    })
  })

  describe('GET /api/deliverynote/:id', () => {
    it('debería obtener un albarán por ID', async () => {
      const res = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.deliveryNote._id).toBe(deliveryNoteId)
    })

    it('debería devolver 404 para ID inexistente', async () => {
      await request(app)
        .get('/api/deliverynote/65f8b3a2c9d1e20012345678')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })
  })

  describe('PUT /api/deliverynote/:id', () => {
    it('debería actualizar un albarán no firmado', async () => {
      const res = await request(app)
        .put(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Descripción actualizada' })
        .expect(200)

      expect(res.body.deliveryNote.description).toBe('Descripción actualizada')
    })
  })

  describe('DELETE /api/deliverynote/:id', () => {
    it('debería eliminar un albarán no firmado', async () => {
      await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
})
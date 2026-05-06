// tests/unit.test.js
import request from 'supertest'
import app from '../src/app.js'
import AppError from '../src/utils/AppError.js'

describe('AppError', () => {
  it('debería crear un error 400', () => {
    const err = AppError.badRequest('Error 400')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Error 400')
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 401', () => {
    const err = AppError.unauthorized('Error 401')
    expect(err.statusCode).toBe(401)
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 403', () => {
    const err = AppError.forbidden('Error 403')
    expect(err.statusCode).toBe(403)
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 404', () => {
    const err = AppError.notFound('Error 404')
    expect(err.statusCode).toBe(404)
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 409', () => {
    const err = AppError.conflict('Error 409')
    expect(err.statusCode).toBe(409)
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 429', () => {
    const err = AppError.tooManyRequests('Error 429')
    expect(err.statusCode).toBe(429)
    expect(err.isOperational).toBe(true)
  })

  it('debería crear un error 500', () => {
    const err = AppError.internal('Error 500')
    expect(err.statusCode).toBe(500)
    expect(err.isOperational).toBe(true)
  })

  it('debería usar mensaje por defecto si no se proporciona', () => {
    expect(AppError.badRequest().message).toBe('Bad Request')
    expect(AppError.unauthorized().message).toBe('Unauthorized')
    expect(AppError.forbidden().message).toBe('Forbidden')
    expect(AppError.notFound().message).toBe('Not Found')
    expect(AppError.conflict().message).toBe('Conflict')
    expect(AppError.tooManyRequests().message).toBe('Too Many Requests')
    expect(AppError.internal().message).toBe('Internal Server Error')
  })
})

describe('Role Middleware', () => {
  let adminToken = ''
  let guestToken = ''

  const adminUser = {
    email: `admin_role_${Date.now()}@example.com`,
    password: 'TestPassword123'
  }

  beforeAll(async () => {
    const resAdmin = await request(app)
      .post('/api/user/register')
      .send(adminUser)
    adminToken = resAdmin.body.accessToken

    await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin', lastName: 'Test', nif: '11111111A' })

    const companyCif = `B${Date.now().toString().slice(-7)}`
    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Empresa Role Test', cif: companyCif, isFreelance: false })

    const guestUser = {
      email: `guest_role_${Date.now()}@example.com`,
      password: 'TestPassword123'
    }
    const resGuest = await request(app)
      .post('/api/user/register')
      .send(guestUser)
    guestToken = resGuest.body.accessToken

    await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ name: 'Guest', lastName: 'Test', nif: '22222222B' })

    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ name: 'Empresa Role Test', cif: companyCif, isFreelance: false })
  })

  it('debería permitir acceso a admin en ruta de admin', async () => {
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: `invited_${Date.now()}@example.com`,
        name: 'Invited',
        lastName: 'User'
      })
    expect([201, 409]).toContain(res.status)
  })

  it('debería denegar acceso a guest en ruta de admin', async () => {
    await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        email: `invited2_${Date.now()}@example.com`,
        name: 'Invited2',
        lastName: 'User'
      })
      .expect(403)
  })
})

describe('Error Handler', () => {
  it('debería manejar errores de validación con 400', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: 'noesvalido' })
      .expect(400)

    expect(res.body).toHaveProperty('message')
  })
})
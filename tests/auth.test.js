// tests/auth.test.js
import request from 'supertest'
import app from '../src/app.js'
import AppError from '../src/utils/AppError.js'
import User from '../src/models/User.js'

describe('Auth Endpoints', () => {
  let token = ''
  let refreshToken = ''

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  }

  describe('POST /api/user/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.email).toBe(testUser.email)
      expect(res.body.user).not.toHaveProperty('password')

      token = res.body.accessToken
      refreshToken = res.body.refreshToken
    })

    it('debería rechazar email duplicado', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send(testUser)
        .expect(409)

      expect(res.body).toHaveProperty('message')
    })

    it('debería rechazar datos inválidos', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({ email: 'invalid' })
        .expect(400)

      expect(res.body).toHaveProperty('message')
    })
  })

  describe('POST /api/user/login', () => {
    it('debería hacer login correctamente', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)

      expect(res.body).toHaveProperty('accessToken')
      token = res.body.accessToken
    })

    it('debería rechazar password incorrecto', async () => {
      await request(app)
        .post('/api/user/login')
        .send({ email: testUser.email, password: 'WrongPassword123' })
        .expect(401)
    })

    it('debería rechazar usuario inexistente', async () => {
      await request(app)
        .post('/api/user/login')
        .send({ email: 'noexiste@example.com', password: 'TestPassword123' })
        .expect(401)
    })
  })

  describe('GET /api/user', () => {
    it('debería acceder con token válido', async () => {
      const res = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.user.email).toBe(testUser.email)
    })

    it('debería rechazar sin token', async () => {
      await request(app)
        .get('/api/user')
        .expect(401)
    })

    it('debería rechazar token inválido', async () => {
      await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401)
    })
  })

  describe('POST /api/user/refresh', () => {
    it('debería renovar el token', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(res.body).toHaveProperty('accessToken')
    })
  })

  describe('POST /api/user/logout', () => {
    it('debería cerrar sesión correctamente', async () => {
      const res = await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body).toHaveProperty('message')
    })
  })

  describe('PUT /api/user/register (datos personales)', () => {
    it('debería actualizar datos personales', async () => {
      const res = await request(app)
        .put('/api/user/register')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', lastName: 'User', nif: '12345678Z' })
        .expect(200)

      expect(res.body).toHaveProperty('user')
    })
  })

  describe('PATCH /api/user/company', () => {
    it('debería crear una compañía', async () => {
      const res = await request(app)
        .patch('/api/user/company')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Empresa Test S.L.', cif: `B${Date.now().toString().slice(-7)}`, isFreelance: false })
        .expect(200)

      expect(res.body).toHaveProperty('company')
    })
  })

  describe('PUT /api/user/password', () => {
    it('debería rechazar contraseña actual incorrecta', async () => {
      await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'WrongPassword123', newPassword: 'NewPassword456' })
        .expect(401)
    })

    it('debería cambiar la contraseña correctamente', async () => {
      const res = await request(app)
        .put('/api/user/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: testUser.password, newPassword: 'NewPassword456' })
        .expect(200)

      expect(res.body).toHaveProperty('message')
    })
  })

  describe('DELETE /api/user', () => {
    it('debería eliminar usuario con soft delete', async () => {
      const tempUser = { email: `delete_${Date.now()}@example.com`, password: 'TestPassword123' }
      const reg = await request(app).post('/api/user/register').send(tempUser)
      const tempToken = reg.body.accessToken

      const res = await request(app)
        .delete('/api/user?soft=true')
        .set('Authorization', `Bearer ${tempToken}`)
        .expect(200)

      expect(res.body).toHaveProperty('message')
    })
  })

  describe('Role Middleware', () => {
    let adminToken = ''
    let guestToken = ''

    beforeAll(async () => {
      const adminUser = { email: `admin_${Date.now()}@example.com`, password: 'TestPassword123' }
      const resAdmin = await request(app).post('/api/user/register').send(adminUser)
      adminToken = resAdmin.body.accessToken

      await request(app).put('/api/user/register').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Admin', lastName: 'Test', nif: '11111111A' })
      const companyCif = `B${Date.now().toString().slice(-7)}`
      await request(app).patch('/api/user/company').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Empresa Role', cif: companyCif, isFreelance: false })

      const guestUser = { email: `guest_${Date.now()}@example.com`, password: 'TestPassword123' }
      const resGuest = await request(app).post('/api/user/register').send(guestUser)
      guestToken = resGuest.body.accessToken

      await request(app).put('/api/user/register').set('Authorization', `Bearer ${guestToken}`).send({ name: 'Guest', lastName: 'Test', nif: '22222222B' })
      await request(app).patch('/api/user/company').set('Authorization', `Bearer ${guestToken}`).send({ name: 'Empresa Role', cif: companyCif, isFreelance: false })
    })

    it('debería permitir acceso a admin', async () => {
      const res = await request(app)
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: `invited_${Date.now()}@example.com`, name: 'Inv', lastName: 'User' })
      expect([201, 409]).toContain(res.status)
    })

    it('debería denegar acceso a guest', async () => {
      await request(app)
        .post('/api/user/invite')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ email: `invited2_${Date.now()}@example.com`, name: 'Inv2', lastName: 'User' })
        .expect(403)
    })
  })

  describe('AppError', () => {
    it('debería crear errores con el statusCode correcto', () => {
      expect(AppError.badRequest().statusCode).toBe(400)
      expect(AppError.unauthorized().statusCode).toBe(401)
      expect(AppError.forbidden().statusCode).toBe(403)
      expect(AppError.notFound().statusCode).toBe(404)
      expect(AppError.conflict().statusCode).toBe(409)
      expect(AppError.tooManyRequests().statusCode).toBe(429)
      expect(AppError.internal().statusCode).toBe(500)
    })

    it('debería usar mensajes por defecto', () => {
      expect(AppError.badRequest().message).toBe('Bad Request')
      expect(AppError.unauthorized().message).toBe('Unauthorized')
      expect(AppError.forbidden().message).toBe('Forbidden')
      expect(AppError.notFound().message).toBe('Not Found')
      expect(AppError.conflict().message).toBe('Conflict')
      expect(AppError.tooManyRequests().message).toBe('Too Many Requests')
      expect(AppError.internal().message).toBe('Internal Server Error')
    })

    it('debería usar mensajes personalizados', () => {
      expect(AppError.badRequest('msg').message).toBe('msg')
      expect(AppError.notFound('msg').message).toBe('msg')
    })

    it('todos los errores deben ser isOperational true', () => {
      expect(AppError.badRequest().isOperational).toBe(true)
      expect(AppError.internal().isOperational).toBe(true)
    })
  })

  describe('PUT /api/user/validation (verifyEmail)', () => {
    let verifyToken = ''
    const verifyUser = {
      email: `verify_${Date.now()}@example.com`,
      password: 'TestPassword123'
    }

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send(verifyUser)
      verifyToken = res.body.accessToken
    })

    it('debería rechazar código incorrecto y decrementar intentos', async () => {
      const res = await request(app)
        .put('/api/user/validation')
        .set('Authorization', `Bearer ${verifyToken}`)
        .send({ code: '000000' })
        .expect(400)

      expect(res.body).toHaveProperty('message')
    })

    it('debería verificar el email con el código correcto', async () => {
      const user = await User.findOne({ email: verifyUser.email })
      const code = user.verificationCode

      const res = await request(app)
        .put('/api/user/validation')
        .set('Authorization', `Bearer ${verifyToken}`)
        .send({ code })
        .expect(200)

      expect(res.body).toHaveProperty('message')
    })

    it('debería rechazar si el email ya está verificado', async () => {
      const user = await User.findOne({ email: verifyUser.email })
      const code = user.verificationCode ?? '123456'

      const res = await request(app)
        .put('/api/user/validation')
        .set('Authorization', `Bearer ${verifyToken}`)
        .send({ code })
        .expect(400)

      expect(res.body).toHaveProperty('message')
    })
  })
})
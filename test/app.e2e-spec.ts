import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
  });

  describe('Auth Flow', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      name: 'Test User',
    };

    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .then((res) => {
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .then((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });
  });
});

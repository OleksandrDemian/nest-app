import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { DatabaseModule } from '../src/database/database.module';
import { Product } from '../src/products/entities/product.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { ValidationPipe } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      imports: [AppModule],
    });

    builder.overrideModule(DatabaseModule).useModule(
      SequelizeModule.forRoot({
        dialect: 'sqlite',
        storage: ':memory:',
        models: [Product],
        synchronize: true,
        autoLoadModels: true,
        logging: false,
      }),
    );

    const moduleFixture: TestingModule = await builder.compile();
    app = moduleFixture.createNestApplication(new FastifyAdapter(), {
      logger: false,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('Module should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/POST products', () => {
    const name = 'Test product 0';
    const productToken = 'test-product-0';

    it('Creates new product', () => {
      return app
        .inject({
          method: 'POST',
          url: '/products',
          payload: {
            name,
            productToken,
            price: 300,
            stock: 5,
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(201);
          const data = JSON.parse(response.payload);
          expect(data.name).toEqual(name);
          expect(data.productToken).toEqual(productToken);
        });
    });

    it('Duplicated productToken (fails)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/products',
          payload: {
            name: 'Different name',
            productToken,
            price: 300,
            stock: 5,
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });

    it('Payload has no required properties (fails)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/products',
          payload: {},
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });

    it('Payload has invalid values (fails)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/products',
          payload: {
            name: 'Invalid price',
            productToken: 'invalid-price',
            price: 'hello',
            stock: 5,
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });

    it('Payload with unknown properties (fails)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/products',
          payload: {
            name: 'Unknown proeprties',
            productToken: 'unknown-properties',
            price: 300,
            stock: 5,
            // invalid field
            nonDeclaredProperty: 'This should not be here',
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });
  });

  describe('Create 25 test products', () => {
    it('Created', async () => {
      const promises = [];
      for (let i = 1; i < 25; i++) {
        const name = `Test product ${i}`;
        const productToken = `test-product-${i}`;
        promises.push(
          app.inject({
            method: 'POST',
            url: '/products',
            payload: {
              name,
              productToken,
              price: Math.floor(Math.random() * 1000) + 1,
              stock: Math.floor(Math.random() * 100) + 1,
            },
          }),
        );
      }

      await Promise.allSettled(promises);
      expect(true).toEqual(true);
    });
  });

  describe('/GET products', () => {
    it('Default pagination', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          expect(data.length).toEqual(10); // by default fetch 10 results
          expect(data[0].id).toEqual(1); // first product
        });
    });

    it('Pagination', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products?limit=10&page=1',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          expect(data.length).toEqual(10);
        });
    });

    it('Last page partial results', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products?limit=10&page=3',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          expect(data.length).toEqual(5);
        });
    });

    it('Wrong query params', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products?limit=awdasd&page=hello',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          // should return default 10 results on first page
          expect(data.length).toEqual(10);
        });
    });
  });

  describe('/GET products/:id', () => {
    it('Get product by id', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products/1',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          expect(data.id).toEqual(1);
        });
    });

    it('Get product by id not found', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products/100',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          expect(JSON.parse(response.payload)).toBeNull();
        });
    });
  });

  describe('/PATCH products/:id', () => {
    it('Update product', () => {
      return app
        .inject({
          method: 'PATCH',
          url: '/products/1',
          payload: {
            stock: 25,
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(204);
        });
    });

    it('Get updated product', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products/1',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          const data = JSON.parse(response.payload);
          expect(data.stock).toEqual(25);
        });
    });

    it('Invalid product ID (fail)', () => {
      return app
        .inject({
          method: 'PATCH',
          url: '/products/100',
          payload: {
            stock: 25,
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(404);
        });
    });

    it('Update invalid properties (fail)', () => {
      return app
        .inject({
          method: 'PATCH',
          url: '/products/1',
          payload: {
            price: 'invalid',
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });

    it('Update unknown properties (fail)', () => {
      return app
        .inject({
          method: 'PATCH',
          url: '/products/1',
          payload: {
            unknownProperty: 'This should not be here',
          },
        })
        .then((response) => {
          expect(response.statusCode).toEqual(400);
        });
    });
  });

  describe('/DELETE products/:id', () => {
    it('Delete product', () => {
      return app
        .inject({
          method: 'DELETE',
          url: '/products/1',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(204);
        });
    });

    it('Get deleted product (not found)', () => {
      return app
        .inject({
          method: 'GET',
          url: '/products/1',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(200);
          expect(JSON.parse(response.payload)).toBeNull();
        });
    });

    it('Delete product not found', () => {
      return app
        .inject({
          method: 'DELETE',
          url: '/products/100',
        })
        .then((response) => {
          expect(response.statusCode).toEqual(404);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

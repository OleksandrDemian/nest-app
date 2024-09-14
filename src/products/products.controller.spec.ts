import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Test } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const newProduct: CreateProductDto = {
  name: 'Test product 0',
  productToken: 'test-product-0',
  price: 300,
  stock: 5,
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        // use SQLite for in-memory database testing
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          models: [Product],
          synchronize: true,
          autoLoadModels: true,
          logging: false,
        }),
        SequelizeModule.forFeature([Product]),
      ],
      providers: [ProductsService],
      controllers: [ProductsController],
    }).compile();

    controller = moduleRef.get(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const result = await controller.create(newProduct);
      expect(result.get({ plain: true })).toEqual({
        id: 1,
        ...newProduct,
      });
    });

    it('should throw an error if product token already exists', async () => {
      try {
        await controller.create(newProduct);
      } catch (error) {
        expect(error.message).toEqual('Product token already exists');
      }
    });
  });

  describe('findOne', () => {
    it('find product by id', async () => {
      const result = await controller.findOne('1');
      expect(result.get({ plain: true })).toEqual({
        id: 1,
        ...newProduct,
      });
    });

    it('should return null if not found', async () => {
      const result = await controller.findOne('9999');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('Mock 25 products', async () => {
      for (let i = 1; i < 25; i++) {
        await controller.create({
          name: `Test product ${i}`,
          productToken: `test-product-${i}`,
          price: 5 * i,
          stock: Math.round(Math.random() * 100),
        });
      }
    });

    it('should return first page', async () => {
      const result = await controller.findAll(1, 10);
      expect(result.length).toEqual(10);
    });

    it('should return third page (5 results)', async () => {
      const result = await controller.findAll(3, 10);
      expect(result.length).toEqual(5);
    });
  });

  describe('update', () => {
    it('should throw error if product does not exist', async () => {
      try {
        await controller.update('9999', { stock: 25 });
      } catch (error) {
        expect(error.message).toEqual('Product not found');
      }
    });

    it('should update an existing product', async () => {
      const updatedProductData: UpdateProductDto = {
        stock: 25,
      };

      await controller.update('1', updatedProductData);
      const result = await controller.findOne('1');
      expect(result.getDataValue('stock')).toEqual(updatedProductData.stock);
    });
  });

  describe('remove', () => {
    it('should throw error if product does not exist', async () => {
      try {
        await controller.remove('9999');
      } catch (error) {
        expect(error.message).toEqual('Product not found');
      }
    });

    it('should remove a product', async () => {
      await controller.remove('1');
      const result = await controller.findOne('1');
      expect(result).toBeNull();
    });
  });
});

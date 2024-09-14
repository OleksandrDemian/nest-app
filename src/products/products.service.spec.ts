import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const newProduct: CreateProductDto = {
  name: 'Test product',
  productToken: 'test-product-1',
  price: 300,
  stock: 5,
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const newProduct: CreateProductDto = {
        name: 'Test product',
        productToken: 'test-product-1',
        price: 300,
        stock: 5,
      };

      const result = await service.create(newProduct);
      expect(result.get({ plain: true })).toEqual({
        id: 1,
        ...newProduct,
      });
    });

    it('should throw an error if product token already exists', async () => {
      try {
        await service.create(newProduct);
      } catch (error) {
        expect(error.message).toEqual('Product token already exists');
      }
    });
  });

  describe('findOne', () => {
    it('find product by id', async () => {
      const result = await service.findOne(1);
      expect(result.get({ plain: true })).toEqual({
        id: 1,
        ...newProduct,
      });
    });

    it('should return null if not found', async () => {
      const result = await service.findOne(9999);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const result = await service.findAll({ limit: 10, page: 1 });
      expect(result.length).toEqual(1);
      expect(result[0].get({ plain: true })).toEqual({
        id: 1,
        ...newProduct,
      });
    });
  });

  describe('update', () => {
    it('should throw error if product does not exist', async () => {
      try {
        await service.update(9999, { stock: 25 });
      } catch (error) {
        expect(error.message).toEqual('Product not found');
      }
    });

    it('should update an existing product', async () => {
      const updatedProductData: UpdateProductDto = {
        stock: 25,
      };

      await service.update(1, updatedProductData);
      const result = await service.findOne(1);
      expect(result.getDataValue('stock')).toEqual(updatedProductData.stock);
    });
  });

  describe('remove', () => {
    it('should throw error if product does not exist', async () => {
      try {
        await service.remove(9999);
      } catch (error) {
        expect(error.message).toEqual('Product not found');
      }
    });

    it('should remove a product', async () => {
      await service.remove(1);
      const result = await service.findOne(1);
      expect(result).toBeNull();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Controller has little to no logic in this case, so the tests focus on calling the service methods with the correct parameters.
 */
describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProduct = {
    id: 1,
    productToken: 'abc123',
    name: 'Test Product',
    price: 100,
    stock: 10,
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('create', () => {
    it('should call productsService.create with the correct parameters', async () => {
      const createProductDto: CreateProductDto = {
        productToken: 'abc123',
        name: 'Test Product',
        price: 100,
        stock: 10,
      };
      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should call productsService.findAll with the correct parameters', async () => {
      const query = { page: 1, limit: 10 };
      const mockResult = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query.page, query.limit);

      expect(result).toEqual(mockResult);
      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle missing query parameters and use default values', async () => {
      const query = { page: undefined, limit: undefined };
      const mockResult = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(query.page, query.limit);

      expect(result).toEqual(mockResult);
      expect(mockProductsService.findAll).toHaveBeenCalledWith({
        page: 1, // default value
        limit: 10, // default value
      });
    });
  });

  describe('findOne', () => {
    it('should call productsService.findOne with the correct parameters', async () => {
      const id = '1';
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(id);

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should call productsService.update with the correct parameters', async () => {
      const id = '1';
      const updateProductDto: UpdateProductDto = { stock: 20 };

      mockProductsService.update.mockResolvedValue(undefined); // Update has no return

      const result = await controller.update(id, updateProductDto);

      expect(result).toBeUndefined();
      expect(mockProductsService.update).toHaveBeenCalledWith(
        1,
        updateProductDto,
      );
    });
  });

  describe('remove', () => {
    it('should call productsService.remove with the correct parameters', async () => {
      const id = '1';

      mockProductsService.remove.mockResolvedValue(undefined); // Remove has no return

      const result = await controller.remove(id);

      expect(result).toBeUndefined();
      expect(mockProductsService.remove).toHaveBeenCalledWith(1);
    });
  });
});

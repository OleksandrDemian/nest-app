import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/sequelize';
import { Product } from './entities/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: 1,
    productToken: 'abc123',
    name: 'Test Product',
    price: 100,
    stock: 10,
    update: jest.fn(),
    destroy: jest.fn(),
  };

  const mockProductModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test to avoid interference
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      mockProductModel.findOne.mockResolvedValue(null); // No existing product with the same token
      mockProductModel.create.mockResolvedValue(mockProduct);

      const result = await service.create({
        productToken: 'abc123',
        name: 'Test Product',
        price: 100,
        stock: 10,
      });

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        where: { productToken: 'abc123' },
      });
      expect(mockProductModel.create).toHaveBeenCalledWith({
        productToken: 'abc123',
        name: 'Test Product',
        price: 100,
        stock: 10,
      });
    });

    it('should throw an error if product token already exists', async () => {
      mockProductModel.findOne.mockResolvedValue(mockProduct);

      await expect(
        service.create({
          productToken: 'abc123',
          name: 'Test Product',
          price: 100,
          stock: 10,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockProductModel.findOne).toHaveBeenCalledWith({
        where: { productToken: 'abc123' },
      });
      expect(mockProductModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const products = [mockProduct];
      mockProductModel.findAll.mockResolvedValue(products);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(products);
      expect(mockProductModel.findAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a product if found', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return null if no product is found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      const result = await service.findOne(1);

      expect(result).toBeNull();
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);

      await service.update(1, { stock: 20 });

      expect(mockProduct.update).toHaveBeenCalledWith({ stock: 20 });
    });

    it('should throw a NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.update(1, { stock: 20 })).rejects.toThrow(
        NotFoundException,
      );

      expect(mockProduct.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      mockProductModel.findByPk.mockResolvedValue(mockProduct);

      await service.remove(1);

      expect(mockProduct.destroy).toHaveBeenCalled();
    });

    it('should throw a NotFoundException if product not found', async () => {
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);

      expect(mockProduct.destroy).not.toHaveBeenCalled();
    });
  });
});

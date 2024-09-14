import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const model = await this.productModel.findOne({
      where: {
        productToken: createProductDto.productToken,
      },
    });

    if (model) {
      throw new BadRequestException('Product token already exists');
    }

    return this.productModel.create(createProductDto);
  }

  findAll({ limit, page }: { page: number; limit: number }) {
    const offset = (page - 1) * limit;
    return this.productModel.findAll({
      limit,
      offset,
    });
  }

  findOne(id: number) {
    return this.productModel.findByPk(id);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const model = await this.productModel.findByPk(id);
    if (!model) {
      throw new NotFoundException('Product not found');
    }

    await model.update(updateProductDto);
  }

  async remove(id: number) {
    const model = await this.productModel.findByPk(id);
    if (!model) {
      throw new NotFoundException('Product not found');
    }

    await model.destroy();
  }
}

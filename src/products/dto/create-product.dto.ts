import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ name: 'productToken', type: String })
  productToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ name: 'name', type: String })
  name: string;

  @IsNumber()
  @Min(0) // I assume the price cannot be negative
  @ApiProperty({ name: 'price', type: Number })
  price: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ name: 'stock', type: Number })
  stock: number;
}

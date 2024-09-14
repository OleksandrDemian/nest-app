import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({ name: 'price', type: Number })
  stock: number;
}

import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'products', timestamps: false })
export class Product extends Model<Product> {
  @AutoIncrement
  @PrimaryKey
  @Column
  declare id: number;

  @Unique
  @Column
  declare productToken: string;

  @Column
  declare name: string;

  @Column
  declare price: number;

  @Column
  declare stock: number;
}

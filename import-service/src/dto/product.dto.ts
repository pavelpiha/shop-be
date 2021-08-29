import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class ProductDto {
  @IsString()
  @IsUUID("4")
  @IsOptional()
  id?: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  img?: string;

  @IsInt()
  @Min(0)
  count: number;

  constructor(data: ProductDto) {
    this.count = Number(data.count);
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.price = Number(data.price);
    this.img = data.img;
  }
}

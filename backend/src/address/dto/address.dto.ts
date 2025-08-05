import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  buyerId: number;

  @IsString()
  addressLine: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  ward: string;

  @IsString()
  phone: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  addressLine?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class AddressResponseDto {
  id: number;
  userId: number;
  buyerId: number;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(address: any) {
    this.id = address.id;
    this.userId = address.userId;
    this.buyerId = address.buyerId;
    this.addressLine = address.addressLine;
    this.city = address.city;
    this.district = address.district;
    this.ward = address.ward;
    this.phone = address.phone;
    this.isDefault = address.isDefault;
    this.createdAt = address.createdAt;
    this.updatedAt = address.updatedAt;
  }

  getFullAddress(): string {
    return `${this.addressLine}, ${this.ward}, ${this.district}, ${this.city}`;
  }
}

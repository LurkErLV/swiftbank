import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsPositive, Min } from 'class-validator';

export class TransactionDto {
  @ApiProperty({
    example: 'ACC1234567890',
    description: 'The account number from which the transaction will be made',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({
    example: 'ACC0987654321',
    description: 'The beneficiary account number that will receive the funds',
  })
  @IsString()
  @IsNotEmpty()
  beneficiaryAccountNumber: string;

  @ApiProperty({
    example: 100.50,
    description: 'The amount to transfer (must be positive)',
    minimum: 0.01,
  })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;
}
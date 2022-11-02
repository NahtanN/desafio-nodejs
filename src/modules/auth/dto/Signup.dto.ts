import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'Nathan Gomes',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'nathan@email.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    default: 'client',
    example: 'employee',
    description:
      'Adicione essa propriedade com o tipo "employee" caso deseje criar uma conta do tipo "funcinario". Caso contratio, pode omitir essa propriedade',
  })
  @IsOptional()
  @IsString()
  type: 'employee' | 'client';
}

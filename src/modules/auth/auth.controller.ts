import { Body, Controller, Post } from '@nestjs/common';
import { Client, Employee, Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils/http-responses';
import { ClientService } from '../client/client.service';
import { EmployeeService } from '../employee/employee.service';
import { AuthService } from './auth.service';
import { Public } from './decorator';
import { SigninDTO, SignupDTO } from './dto';
import { TokenAccessType } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientService: ClientService,
    private readonly employeeService: EmployeeService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDTO: SignupDTO): Promise<HttpResponse> {
    const { email, password, name, type } = signupDTO;

    // Criptografar senha
    const { hash, salt } = this.authService.genPassword(password);

    const createData: Prisma.EmployeeCreateInput | Prisma.ClientCreateInput = {
      email,
      name,
      password: `${hash}.${salt}`,
    };

    let responseUserType: string;

    if (type === 'employee') {
      await this.employeeService.create(
        createData as Prisma.EmployeeCreateInput,
      );
      responseUserType = 'Funcionario';
    } else {
      await this.clientService.create(createData as Prisma.ClientCreateInput);
      responseUserType = 'Cliente';
    }

    return HttpResponse.created(`${responseUserType} cadastrado com sucesso!`);
  }

  @Public()
  @Post('signin')
  async signin(@Body() signinDTO: SigninDTO): Promise<HttpResponse> {
    const { password, email, type } = signinDTO;

    let user: Partial<Client | Employee>;

    const where: Prisma.EmployeeWhereInput | Prisma.ClientWhereInput = {
      email,
    };
    const select: Prisma.EmployeeSelect | Prisma.ClientSelect = {
      id: true,
      email: true,
      password: true,
    };

    let responseUserType: string;
    let userType: TokenAccessType;

    // Encontra usuário
    if (type === 'employee') {
      user = await this.employeeService.find(
        where as Prisma.EmployeeWhereInput,
        select as Prisma.EmployeeSelect,
      );
      responseUserType = 'funcionario';
      userType = TokenAccessType.EMPLOYEE;
    } else {
      user = await this.clientService.find(
        where as Prisma.ClientWhereInput,
        select as Prisma.ClientSelect,
      );
      responseUserType = 'cliente';
      userType = TokenAccessType.CLIENT;
    }

    if (!user) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Verifica senha
    if (!this.authService.validPassword(password, user.password)) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Cria Tokens
    const tokens = await this.authService.getTokens(
      user.email,
      user.id,
      userType,
    );

    return HttpResponse.ok(
      `Logado como ${responseUserType} com sucesso!`,
      tokens,
    );
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { Prisma, TimeMeasures } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { Employee } from '../auth/decorator';
import { CreateServiceDto } from './dto';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async getServices(): Promise<HttpResponse> {
    const services = await this.serviceService.findMany(
      {
        deletedAt: null,
      },
      {
        name: true,
        description: true,
        estimatedTime: true,
        timeMeasure: true,
        value: true,
      },
    );

    return HttpResponse.ok('Serviços retornado com sucesso!', services);
  }

  @Post()
  async createService(
    @Body() createServiceBody: CreateServiceDto,
  ): Promise<HttpResponse> {
    const {
      name,
      description,
      value,
      commissionPercentage,
      estimatedTime,
      timeMeasure,
    } = createServiceBody;

    // Calcula o valor da comissao
    const commissionValue = Math.round(value * (commissionPercentage / 100));

    let serviceData: Prisma.ServiceCreateInput = {
      name,
      description,
      value,
      commissionPercentage,
      estimatedTime,
      commissionValue,
    };

    if (timeMeasure) {
      serviceData = {
        ...serviceData,
        timeMeasure: timeMeasure as TimeMeasures,
      };
    }

    const newService = await this.serviceService.create(serviceData);

    return HttpResponse.created('Servico criado!', newService);
  }
}

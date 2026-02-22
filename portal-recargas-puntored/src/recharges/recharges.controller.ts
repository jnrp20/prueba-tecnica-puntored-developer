import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RechargesService } from './recharges.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';

type AuthenticatedRequest = {
  user: {
    userId: string;
    username: string;
  };
};

@ApiTags('Recharges/buy')
@ApiBearerAuth()
@Controller('recharges')
@UseGuards(AuthGuard('jwt'))
export class RechargesController {
  constructor(private readonly rechargesService: RechargesService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Realiza una recarga de saldo para un usuario' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRechargeDto) {
    return this.rechargesService.processRecharge(req.user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtiene el historial de recargas del usuario' })
  history(@Req() req: AuthenticatedRequest) {
    return this.rechargesService.findUserHistory(req.user.userId);
  }
}

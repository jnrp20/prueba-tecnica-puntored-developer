import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersApplicationService } from '../../application/users-application.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo usuario' })
  async create(@Body() dto: CreateUserDto) {
    await this.usersService.createUser(dto.username, dto.password);
    return { message: 'Usuario creado correctamente' };
  }
}

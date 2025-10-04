import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AtGuard } from '../common/guards/at.guard';
import { GetCurrentUserId } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@GetCurrentUserId() userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  updateCurrentUser(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  removeCurrentUser(@GetCurrentUserId() userId: string) {
    return this.usersService.remove(userId);
  }
}

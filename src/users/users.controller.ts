import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/users.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get complete user profile with skills' })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile and skills',
    description: 'Update headline, summary, skills, LinkedIn, GitHub, desired salary, etc.',
  })
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: { id: string }) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview data' })
  getDashboard(@CurrentUser() user: { id: string }) {
    return this.usersService.getDashboardData(user.id);
  }
}

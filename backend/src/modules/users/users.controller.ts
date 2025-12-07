import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of users' })
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User details' })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user (soft delete)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get user by email' })
    @ApiResponse({ status: 200, description: 'User details' })
    async findByEmail(@Param('email') email: string) {
        return this.usersService.findByEmail(email);
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'Get users by company' })
    @ApiResponse({ status: 200, description: 'List of users for specific company' })
    async findByCompany(@Param('companyId') companyId: string) {
        return this.usersService.findByCompany(companyId);
    }

    @Get('role/:role')
    @ApiOperation({ summary: 'Get users by role' })
    @ApiResponse({ status: 200, description: 'List of users with specific role' })
    async findByRole(@Param('role') role: string) {
        return this.usersService.findByRole(role);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search users' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async search(@Query('q') query: string) {
        return this.usersService.search(query);
    }

    @Put(':id/profile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'User profile updated successfully' })
    async updateProfile(@Param('id') id: string, @Body() updateUserProfileDto: UpdateUserProfileDto) {
        return this.usersService.updateProfile(id, updateUserProfileDto);
    }

    @Put(':id/password')
    @ApiOperation({ summary: 'Update user password' })
    @ApiResponse({ status: 200, description: 'User password updated successfully' })
    async updatePassword(@Param('id') id: string, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
        return this.usersService.updatePassword(id, updateUserPasswordDto);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get user statistics' })
    @ApiResponse({ status: 200, description: 'User statistics' })
    async getUserStats() {
        return this.usersService.getUserStats();
    }

    @Get(':id/activity')
    @ApiOperation({ summary: 'Get user activity' })
    @ApiResponse({ status: 200, description: 'User activity data' })
    async getUserActivity(@Param('id') id: string) {
        return this.usersService.getUserActivity(id);
    }
}
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    @ApiResponse({ status: 201, description: 'Team created successfully' })
    async create(@Body() createTeamDto: CreateTeamDto) {
        return this.teamsService.create(createTeamDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams' })
    @ApiResponse({ status: 200, description: 'List of teams' })
    async findAll() {
        return this.teamsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID' })
    @ApiResponse({ status: 200, description: 'Team details' })
    async findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update team' })
    @ApiResponse({ status: 200, description: 'Team updated successfully' })
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
        return this.teamsService.update(id, updateTeamDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete team (soft delete)' })
    @ApiResponse({ status: 200, description: 'Team deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.teamsService.remove(id);
    }

    @Post(':id/users')
    @ApiOperation({ summary: 'Add user to team' })
    @ApiResponse({ status: 201, description: 'User added to team successfully' })
    async addUserToTeam(@Param('id') id: string, @Body() addUserToTeamDto: AddUserToTeamDto) {
        return this.teamsService.addUserToTeam(id, addUserToTeamDto);
    }

    @Delete(':id/users/:userId')
    @ApiOperation({ summary: 'Remove user from team' })
    @ApiResponse({ status: 200, description: 'User removed from team successfully' })
    async removeUserFromTeam(@Param('id') id: string, @Param('userId') userId: string) {
        return this.teamsService.removeUserFromTeam(id, userId);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get teams by user' })
    @ApiResponse({ status: 200, description: 'List of teams for specific user' })
    async findTeamsByUser(@Param('userId') userId: string) {
        return this.teamsService.findTeamsByUser(userId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get team statistics' })
    @ApiResponse({ status: 200, description: 'Team statistics' })
    async getTeamStats() {
        return this.teamsService.getTeamStats();
    }
}
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProjectsService } from '@/modules/projects/projects.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { CreateTaskDto } from '@/modules/projects/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/projects/dto/update-task.dto';
import { CreateTimeEntryDto } from '@/modules/projects/dto/create-time-entry.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // ========================
    // PROJECTS
    // ========================

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'Project created successfully' })
    async create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    @ApiResponse({ status: 200, description: 'List of projects' })
    async findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiResponse({ status: 200, description: 'Project details' })
    async findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update project' })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete project (soft delete)' })
    @ApiResponse({ status: 200, description: 'Project deleted successfully' })
    async remove(@Param('id') id: string) {
        return this.projectsService.remove(id);
    }

    @Get('company/:companyId')
    @ApiOperation({ summary: 'Get projects by company' })
    @ApiResponse({ status: 200, description: 'List of projects for a company' })
    async findByCompany(@Param('companyId') companyId: string) {
        return this.projectsService.findByCompany(companyId);
    }

    @Get('status/:status')
    @ApiOperation({ summary: 'Get projects by status' })
    @ApiResponse({ status: 200, description: 'List of projects with specific status' })
    async findByStatus(@Param('status') status: string) {
        return this.projectsService.findByStatus(status);
    }

    // ========================
    // TASKS
    // ========================

    @Post('tasks')
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: 'Task created successfully' })
    async createTask(@Body() createTaskDto: CreateTaskDto) {
        return this.projectsService.createTask(createTaskDto);
    }

    @Get('tasks/:id')
    @ApiOperation({ summary: 'Get task by ID' })
    @ApiResponse({ status: 200, description: 'Task details' })
    async findTask(@Param('id') id: string) {
        return this.projectsService.findTask(id);
    }

    @Put('tasks/:id')
    @ApiOperation({ summary: 'Update task' })
    @ApiResponse({ status: 200, description: 'Task updated successfully' })
    async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.projectsService.updateTask(id, updateTaskDto);
    }

    @Delete('tasks/:id')
    @ApiOperation({ summary: 'Delete task (soft delete)' })
    @ApiResponse({ status: 200, description: 'Task deleted successfully' })
    async removeTask(@Param('id') id: string) {
        return this.projectsService.removeTask(id);
    }

    @Get(':projectId/tasks')
    @ApiOperation({ summary: 'Get tasks by project' })
    @ApiResponse({ status: 200, description: 'List of tasks for a project' })
    async findTasksByProject(@Param('projectId') projectId: string) {
        return this.projectsService.findTasksByProject(projectId);
    }

    // ========================
    // TIME ENTRIES
    // ========================

    @Post('time-entries')
    @ApiOperation({ summary: 'Create a time entry' })
    @ApiResponse({ status: 201, description: 'Time entry created successfully' })
    async createTimeEntry(@Body() createTimeEntryDto: CreateTimeEntryDto) {
        return this.projectsService.createTimeEntry(createTimeEntryDto);
    }

    @Get(':projectId/time-entries')
    @ApiOperation({ summary: 'Get time entries by project' })
    @ApiResponse({ status: 200, description: 'List of time entries for a project' })
    async findTimeEntriesByProject(@Param('projectId') projectId: string) {
        return this.projectsService.findTimeEntriesByProject(projectId);
    }

    @Get('time-entries/user/:userId')
    @ApiOperation({ summary: 'Get time entries by user' })
    @ApiResponse({ status: 200, description: 'List of time entries for a user' })
    async findTimeEntriesByUser(@Param('userId') userId: string) {
        return this.projectsService.findTimeEntriesByUser(userId);
    }
}

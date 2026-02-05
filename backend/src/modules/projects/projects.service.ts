import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateProjectDto } from '@/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/modules/projects/dto/update-project.dto';
import { CreateTaskDto } from '@/modules/projects/dto/create-task.dto';
import { UpdateTaskDto } from '@/modules/projects/dto/update-task.dto';
import { CreateTimeEntryDto } from '@/modules/projects/dto/create-time-entry.dto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    // ========================
    // PROJECTS
    // ========================

    async create(createProjectDto: CreateProjectDto) {
        return this.prisma.project.create({
            data: {
                ...createProjectDto,
                startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : undefined,
                dueDate: createProjectDto.dueDate ? new Date(createProjectDto.dueDate) : undefined,
            },
            include: {
                company: true,
                createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }

    async findAll() {
        return this.prisma.project.findMany({
            where: { deletedAt: null },
            include: {
                company: true,
                createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                tasks: { where: { deletedAt: null } },
                _count: { select: { tasks: true, timeEntries: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id, deletedAt: null },
            include: {
                company: true,
                quote: true,
                createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                tasks: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    include: {
                        assignedTo: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
                timeEntries: {
                    orderBy: { date: 'desc' },
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }

        return project;
    }

    async update(id: string, updateProjectDto: UpdateProjectDto) {
        return this.prisma.project.update({
            where: { id },
            data: {
                ...updateProjectDto,
                startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
                dueDate: updateProjectDto.dueDate ? new Date(updateProjectDto.dueDate) : undefined,
            },
            include: {
                company: true,
                createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }

    async remove(id: string) {
        return this.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.project.findMany({
            where: { companyId, deletedAt: null },
            include: {
                company: true,
                _count: { select: { tasks: true, timeEntries: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByStatus(status: string) {
        return this.prisma.project.findMany({
            where: { status: status as any, deletedAt: null },
            include: {
                company: true,
                _count: { select: { tasks: true, timeEntries: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ========================
    // TASKS
    // ========================

    async createTask(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
            },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
            },
        });
    }

    async findTask(id: string) {
        const task = await this.prisma.task.findUnique({
            where: { id, deletedAt: null },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
            },
        });

        if (!task) {
            throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
        }

        return task;
    }

    async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
        const data: any = {
            ...updateTaskDto,
            dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
        };

        if (updateTaskDto.status === 'done') {
            data.completedAt = new Date();
        }

        return this.prisma.task.update({
            where: { id },
            data,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
            },
        });
    }

    async removeTask(id: string) {
        return this.prisma.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async findTasksByProject(projectId: string) {
        return this.prisma.task.findMany({
            where: { projectId, deletedAt: null },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { order: 'asc' },
        });
    }

    // ========================
    // TIME ENTRIES
    // ========================

    async createTimeEntry(createTimeEntryDto: CreateTimeEntryDto) {
        const timeEntry = await this.prisma.timeEntry.create({
            data: {
                ...createTimeEntryDto,
                date: createTimeEntryDto.date ? new Date(createTimeEntryDto.date) : new Date(),
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                project: { select: { id: true, name: true } },
            },
        });

        // Update project actual hours
        await this.prisma.project.update({
            where: { id: createTimeEntryDto.projectId },
            data: { actualHours: { increment: createTimeEntryDto.hours } },
        });

        return timeEntry;
    }

    async findTimeEntriesByProject(projectId: string) {
        return this.prisma.timeEntry.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { date: 'desc' },
        });
    }

    async findTimeEntriesByUser(userId: string) {
        return this.prisma.timeEntry.findMany({
            where: { userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async create(createTeamDto: CreateTeamDto) {
        return this.prisma.team.create({
            data: createTeamDto,
        });
    }

    async findAll() {
        return this.prisma.team.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.team.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateTeamDto: UpdateTeamDto) {
        return this.prisma.team.update({
            where: {
                id,
            },
            data: updateTeamDto,
        });
    }

    async remove(id: string) {
        return this.prisma.team.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async addUserToTeam(teamId: string, addUserToTeamDto: AddUserToTeamDto) {
        const user = await this.usersService.findOne(addUserToTeamDto.userId);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Check if user is already in team
        const existingMember = await this.prisma.userTeam.findFirst({
            where: {
                userId: addUserToTeamDto.userId,
                teamId,
            },
        });

        if (existingMember) {
            throw new BadRequestException('El usuario ya pertenece a este equipo');
        }

        return this.prisma.userTeam.create({
            data: {
                userId: addUserToTeamDto.userId,
                teamId,
                role: addUserToTeamDto.role || 'member',
            },
        });
    }

    async removeUserFromTeam(teamId: string, userId: string) {
        return this.prisma.userTeam.delete({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });
    }

    async findTeamsByUser(userId: string) {
        return this.prisma.userTeam.findMany({
            where: {
                userId,
            },
            include: {
                team: true,
            },
        });
    }

    async getTeamStats() {
        const totalTeams = await this.prisma.team.count({
            where: {
                deletedAt: null,
            },
        });

        const teamsWithUsers = await this.prisma.team.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                users: true,
            },
        });

        return {
            totalTeams,
            averageTeamSize: totalTeams > 0
                ? teamsWithUsers.reduce((sum, team) => sum + team.users.length, 0) / totalTeams
                : 0,
            largestTeam: teamsWithUsers.reduce((max, team) =>
                team.users.length > max.users.length ? team : max, teamsWithUsers[0]),
        };
    }
}
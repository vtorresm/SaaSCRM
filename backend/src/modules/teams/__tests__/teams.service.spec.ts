import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../teams.service';
import { PrismaService } from '../../../config/prisma.service';
import { UsersService } from '../../users/users.service';

describe('TeamsService', () => {
    let service: TeamsService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeamsService,
                {
                    provide: PrismaService,
                    useValue: {
                        team: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        userTeam: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TeamsService>(TeamsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a team', async () => {
            const createTeamDto = {
                name: 'Sales Team',
                description: 'Sales department team',
            };

            jest.spyOn(prismaService.team, 'create').mockResolvedValue({
                id: 'test-team-id',
                ...createTeamDto,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.create(createTeamDto);
            expect(result).toBeDefined();
            expect(result.name).toBe(createTeamDto.name);
        });
    });

    describe('findAll', () => {
        it('should return an array of teams', async () => {
            const mockTeams = [
                {
                    id: '1',
                    name: 'Sales Team',
                    description: 'Sales department team',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.team, 'findMany').mockResolvedValue(mockTeams);

            const result = await service.findAll();
            expect(result).toEqual(mockTeams);
        });
    });

    describe('addUserToTeam', () => {
        it('should add user to team', async () => {
            const addUserToTeamDto = {
                userId: 'test-user-id',
                role: 'member',
            };

            jest.spyOn(prismaService.userTeam, 'findFirst').mockResolvedValue(null);
            jest.spyOn(prismaService.userTeam, 'create').mockResolvedValue({
                userId: addUserToTeamDto.userId,
                teamId: 'test-team-id',
                role: addUserToTeamDto.role,
                joinedAt: new Date(),
            });

            const result = await service.addUserToTeam('test-team-id', addUserToTeamDto);
            expect(result).toBeDefined();
            expect(result.userId).toBe(addUserToTeamDto.userId);
        });
    });

    describe('getTeamStats', () => {
        it('should return team statistics', async () => {
            jest.spyOn(prismaService.team, 'count').mockResolvedValue(5);
            jest.spyOn(prismaService.team, 'findMany').mockResolvedValue([
                {
                    id: '1',
                    name: 'Team 1',
                    description: 'Team 1 description',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: '2',
                    name: 'Team 2',
                    description: 'Team 2 description',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ]);

            const result = await service.getTeamStats();
            expect(result).toBeDefined();
            expect(result.totalTeams).toBe(5);
            expect(result.averageTeamSize).toBeGreaterThan(0);
        });
    });
});
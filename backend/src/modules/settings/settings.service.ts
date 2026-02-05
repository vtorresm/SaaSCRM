import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/config/prisma.service';
import { CreateSettingDto } from '@/modules/settings/dto/create-setting.dto';
import { UpdateSettingDto } from '@/modules/settings/dto/update-setting.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async create(createSettingDto: CreateSettingDto) {
        const existing = await this.prisma.systemSetting.findUnique({
            where: { key: createSettingDto.key },
        });

        if (existing) {
            throw new ConflictException(`La configuración con clave '${createSettingDto.key}' ya existe`);
        }

        return this.prisma.systemSetting.create({
            data: createSettingDto,
        });
    }

    async findAll() {
        return this.prisma.systemSetting.findMany({
            orderBy: { key: 'asc' },
        });
    }

    async findByKey(key: string) {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundException(`Configuración con clave '${key}' no encontrada`);
        }

        return setting;
    }

    async getValue(key: string): Promise<string | null> {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        return setting?.value ?? null;
    }

    async update(key: string, updateSettingDto: UpdateSettingDto) {
        const existing = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!existing) {
            throw new NotFoundException(`Configuración con clave '${key}' no encontrada`);
        }

        return this.prisma.systemSetting.update({
            where: { key },
            data: updateSettingDto,
        });
    }

    async upsert(createSettingDto: CreateSettingDto) {
        return this.prisma.systemSetting.upsert({
            where: { key: createSettingDto.key },
            update: { value: createSettingDto.value, description: createSettingDto.description },
            create: createSettingDto,
        });
    }

    async remove(key: string) {
        const existing = await this.prisma.systemSetting.findUnique({
            where: { key },
        });

        if (!existing) {
            throw new NotFoundException(`Configuración con clave '${key}' no encontrada`);
        }

        return this.prisma.systemSetting.delete({ where: { key } });
    }
}

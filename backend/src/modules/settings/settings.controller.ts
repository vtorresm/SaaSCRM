import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SettingsService } from '@/modules/settings/settings.service';
import { CreateSettingDto } from '@/modules/settings/dto/create-setting.dto';
import { UpdateSettingDto } from '@/modules/settings/dto/update-setting.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a system setting' })
    @ApiResponse({ status: 201, description: 'Setting created' })
    async create(@Body() createSettingDto: CreateSettingDto) {
        return this.settingsService.create(createSettingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all system settings' })
    @ApiResponse({ status: 200, description: 'List of settings' })
    async findAll() {
        return this.settingsService.findAll();
    }

    @Get(':key')
    @ApiOperation({ summary: 'Get a setting by key' })
    @ApiResponse({ status: 200, description: 'Setting details' })
    async findByKey(@Param('key') key: string) {
        return this.settingsService.findByKey(key);
    }

    @Put(':key')
    @ApiOperation({ summary: 'Update a setting' })
    @ApiResponse({ status: 200, description: 'Setting updated' })
    async update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
        return this.settingsService.update(key, updateSettingDto);
    }

    @Post('upsert')
    @ApiOperation({ summary: 'Create or update a setting' })
    @ApiResponse({ status: 200, description: 'Setting upserted' })
    async upsert(@Body() createSettingDto: CreateSettingDto) {
        return this.settingsService.upsert(createSettingDto);
    }

    @Delete(':key')
    @ApiOperation({ summary: 'Delete a setting' })
    @ApiResponse({ status: 200, description: 'Setting deleted' })
    async remove(@Param('key') key: string) {
        return this.settingsService.remove(key);
    }
}

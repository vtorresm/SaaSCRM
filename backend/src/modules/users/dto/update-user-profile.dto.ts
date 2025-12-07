import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserProfileDto extends PartialType(CreateUserDto) {
    firstName?: string;
    lastName?: string;
    phone?: string;
    timezone?: string;
    language?: string;
    profilePicture?: string;
}
import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from "@/modules/contacts/dto/create-contact.dto";

export class UpdateContactDto extends PartialType(CreateContactDto) { }
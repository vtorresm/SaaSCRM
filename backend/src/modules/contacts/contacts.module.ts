import { Module } from '@nestjs/common';
import { ContactsController } from "@/modules/contacts/contacts.controller";
import { ContactsService } from "@/modules/contacts/contacts.service";

@Module({
    controllers: [ContactsController],
    providers: [ContactsService],
    exports: [ContactsService],
})
export class ContactsModule { }
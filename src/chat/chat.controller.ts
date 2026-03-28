import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateRoom } from "./dto/chat.create-room";
import { User } from "src/common/decorators/decorator.user";

@Controller('/room')
export class ChatController {
    constructor(
        private chatService : ChatService,
    ) {}

    @Post()
    async createRoom(@Body() req : CreateRoom, @User('sub') id : number) {
        return this.chatService.createRoom(req, id)
    }

    @Get()
    async getRooms(@Query('page') page : number) {
        const rooms = await this.chatService.getRooms(page)
        return rooms
    }
    
    @Get('/:roomCode')
    async getRoomDetail(@Param('roomCode') roomCode: string) {
        const room = await this.chatService.roomDetail(roomCode)
        return room
    }
}
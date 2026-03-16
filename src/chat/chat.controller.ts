import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateRoom } from "./dto/chat.create-room";
import { User } from "src/common/decorators/decorator.user";

@Controller()
export class ChatGateway {
    constructor(
        private chatService : ChatService,
    ) {}

    @Post('room')
    async createRoom(req : CreateRoom, @User('sub') id : number) {
        this.chatService.createRoom(req, id)
    }

    @Get('room')
    async getRooms(@Query('page') page : number) {
        const rooms = await this.chatService.getRooms(page)
        return rooms
    }

    @Get('room/:roomCode')
    async getRoomDetail(@Param() roomCode: string) {
        const room = await this.chatService.roomDetail(roomCode)
        return room
    }
}
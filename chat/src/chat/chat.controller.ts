import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { CreateRoom } from "./dto/chat.create-room";
import { User } from "src/common/decorators/decorator.user";
import { Public } from "src/common/decorators/decorator.public";

@Controller('/room')
export class ChatController {
    constructor(
        private chatService : ChatService,
    ) {}

    @Public()
    @Post()
    async createRoom(@Body() req : CreateRoom, @User('sub') id : number) {
        this.chatService.createRoom(req, id)
    }
    @Public()
    @Get()
    async getRooms(@Query('page') page : number) {
        const rooms = await this.chatService.getRooms(page)
        return rooms
    }
    @Public()
    @Get('/:roomCode')
    async getRoomDetail(@Param('roomCode') roomCode: string) {
        const room = await this.chatService.roomDetail(roomCode)
        return room
    }
}
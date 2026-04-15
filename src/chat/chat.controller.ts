import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { AllowUnverified } from "../common/decorators/decorator.allow-unverified";
import { User } from "../common/decorators/decorator.user";
import { UseGuards } from "@nestjs/common";
import { EmailVerifiedGuard } from "../user/auth/email-verified.guard";
import { ChatService } from "./chat.service";
import { CreateRoomResponse } from "./dto/chat.create-room-response";
import { CreateRoom } from "./dto/chat.create-room";
import { RoomListResponse } from "./dto/chat.room-list-response";
import { RoomPageQuery } from "./dto/chat.room-page-query";
import { RoomResponse } from "./dto/chat.room-response";

@ApiTags('rooms')
@ApiBearerAuth('access-token')
@Controller('/room')
@UseGuards(EmailVerifiedGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @ApiOperation({
        summary: '채팅방 생성',
        description: '현재 로그인한 사용자를 방장으로 새로운 채팅방을 생성합니다.',
    })
    @ApiCreatedResponse({
        description: '채팅방 생성 성공',
        type: CreateRoomResponse,
    })
    @ApiUnauthorizedResponse({ description: '유효한 access token이 필요합니다.' })
    @ApiForbiddenResponse({ description: '이메일 인증이 완료된 사용자만 접근할 수 있습니다.' })
    @Post()
    async createRoom(@Body() req: CreateRoom, @User('sub') id: number) {
        return this.chatService.createRoom(req, id);
    }

    @ApiOperation({
        summary: '공개 채팅방 목록 조회',
        description: '공개 상태의 채팅방만 페이지네이션으로 조회합니다.',
    })
    @ApiOkResponse({
        description: '공개 채팅방 목록 조회 성공',
        type: RoomListResponse,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: '페이지 번호. 기본값은 1입니다.',
    })
    @AllowUnverified()
    @Get()
    async getRooms(@Query() query: RoomPageQuery) {
        return this.chatService.getRooms(query.page);
    }

    @ApiOperation({
        summary: '채팅방 상세 조회',
        description: 'roomCode 기준으로 특정 채팅방의 상세 정보를 조회합니다.',
    })
    @ApiOkResponse({
        description: '채팅방 상세 조회 성공',
        type: RoomResponse,
    })
    @ApiNotFoundResponse({ description: '해당 roomCode의 채팅방이 없습니다.' })
    @ApiForbiddenResponse({ description: '이메일 인증이 완료된 사용자만 접근할 수 있습니다.' })
    @Get('/:roomCode')
    async getRoomDetail(@Param('roomCode') roomCode: string) {
        return this.chatService.roomDetail(roomCode);
    }
}

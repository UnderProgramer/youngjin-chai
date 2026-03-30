import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Room } from "@prisma/client";
import Hashids from "hashids";
import { RoomAccessDeniedException } from "src/common/global/exception/custom-exceptions/http/RoomAccessDeniedException";
import { RoomAlreadyJoinedException } from "src/common/global/exception/custom-exceptions/http/RoomAlreadyJoinedException";
import { RoomNotFoundException } from "src/common/global/exception/custom-exceptions/http/RoomNotFoundException";
import { RoomParticipantNotFoundException } from "src/common/global/exception/custom-exceptions/http/RoomParticipantNotFoundException";
import { MessageRequiredException } from "src/common/global/exception/custom-exceptions/ws/MessageRequiredException";
import { ChatRepository } from "./chat.repository";

@Injectable()
export class ChatManager {
    private readonly hashids: Hashids;

    constructor(
        private readonly configService: ConfigService,
        private readonly chatRepository: ChatRepository,
    ) {
        const salt = this.configService.get<string>("ROOM_SALT") ?? "room";
        this.hashids = new Hashids(salt, 8);
    }

    private generateRoomCode() {
        const randomIndex = Math.floor(Math.random() * 1_000_000);
        return this.hashids.encode(randomIndex);
    }

    async generateUniqueRoomCode() {
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const roomCode = this.generateRoomCode();
            const existingRoom = await this.chatRepository.findRoomByCode(roomCode);

            if (!existingRoom) {
                return roomCode;
            }
        }

        throw new InternalServerErrorException("Unable to generate a unique room code.");
    }

    normalizePage(page?: number) {
        const safePage = !page || page < 1 ? 1 : page;
        return {
            page: safePage,
            pageSize: 8,
            skip: (safePage - 1) * 8,
        };
    }

    async getRoomByCodeOrThrow(roomCode: string) {
        const room = await this.chatRepository.findRoomByCode(roomCode);

        if (!room) {
            throw new RoomNotFoundException(roomCode);
        }

        return room;
    }

    ensureRoomIsPublic(room: Room) {
        if (room.is_privated) {
            throw new RoomAccessDeniedException(room.room_code);
        }
    }

    async ensureUserJoinedRoom(roomCode: string, userId: number) {
        const joinedUser = await this.chatRepository.findJoinedUser(roomCode, userId);

        if (!joinedUser) {
            throw new RoomParticipantNotFoundException(roomCode, userId);
        }

        return joinedUser;
    }

    async ensureUserNotJoinedRoom(roomCode: string, userId: number) {
        const joinedUser = await this.chatRepository.findJoinedUser(roomCode, userId);

        if (joinedUser) {
            throw new RoomAlreadyJoinedException(roomCode, userId);
        }
    }

    validateMessage(message: string) {
        if (!message?.trim()) {
            throw new MessageRequiredException();
        }

        return message.trim();
    }
}

import { Injectable } from "@nestjs/common";
import { Users } from "@prisma/client";
import { RoomAccessDeniedException } from "src/common/global/exception/custom-exceptions/http/RoomAccessDeniedException";
import { RoomAlreadyJoinedException } from "src/common/global/exception/custom-exceptions/http/RoomAlreadyJoinedException";
import { RoomNotFoundException } from "src/common/global/exception/custom-exceptions/http/RoomNotFoundException";
import { RoomParticipantNotFoundException } from "src/common/global/exception/custom-exceptions/http/RoomParticipantNotFoundException";
import { RoomAccessDeniedException as WsRoomAccessDeniedException } from "src/common/global/exception/custom-exceptions/ws/RoomAccessDeniedException";
import { RoomAlreadyJoinedException as WsRoomAlreadyJoinedException } from "src/common/global/exception/custom-exceptions/ws/RoomAlreadyJoinedException";
import { RoomNotFoundException as WsRoomNotFoundException } from "src/common/global/exception/custom-exceptions/ws/RoomNotFoundException";
import { RoomParticipantNotFoundException as WsRoomParticipantNotFoundException } from "src/common/global/exception/custom-exceptions/ws/RoomParticipantNotFoundException";
import { UserNotFoundException } from "src/common/global/exception/custom-exceptions/http/UserNotFoundException";
import { UserNotFoundException as WsUserNotFoundException } from "src/common/global/exception/custom-exceptions/ws/UserNotFoundException";
import { UserManager } from "src/user/user.manager";
import { ChatManager } from "./chat.manager";
import { ChatRepository } from "./chat.repository";
import { CreateRoom } from "./dto/chat.create-room";

@Injectable()
export class ChatService {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly chatManager: ChatManager,
        private readonly userManager: UserManager,
    ) {}

    async createRoom(req: CreateRoom, id: number) {
        const user = await this.userManager.getUserByIdOrThrow(id);
        const roomCode = await this.chatManager.generateUniqueRoomCode();

        await this.chatRepository.createRoom({
            roomName: req.roomName,
            roomDescription: req.roomDescription,
            roomCode,
            userId: user.id,
            isPrivate: req.roomIsPrivate,
        });

        return {
            roomCode,
        };
    }

    async joinRoom(roomCode: string, user: Users) {
        try {
            const room = await this.chatManager.getRoomByCodeOrThrow(roomCode);
            this.chatManager.ensureRoomIsPublic(room);
            await this.chatRepository.upsertJoinRoom(user.id, roomCode);
        } catch (error) {
            if (error instanceof RoomNotFoundException) {
                throw new WsRoomNotFoundException(roomCode);
            }

            if (error instanceof RoomAccessDeniedException) {
                throw new WsRoomAccessDeniedException(roomCode);
            }

            throw error;
        }
    }

    async invitePrivateRoom(roomCode: string, user: Users, inviteEmail: string) {
        let inviteUserId: number | undefined;

        try {
            await this.chatManager.getRoomByCodeOrThrow(roomCode);
            await this.chatManager.ensureUserJoinedRoom(roomCode, user.id);

            const inviteUser = await this.userManager.getUserByEmailOrThrow(inviteEmail);
            inviteUserId = inviteUser.id;
            await this.chatManager.ensureUserNotJoinedRoom(roomCode, inviteUser.id);

            await this.chatRepository.createJoinRoom(inviteUser.id, roomCode);
        } catch (error) {
            if (error instanceof RoomNotFoundException) {
                throw new WsRoomNotFoundException(roomCode);
            }

            if (error instanceof RoomParticipantNotFoundException) {
                throw new WsRoomParticipantNotFoundException(roomCode, user.id);
            }

            if (error instanceof RoomAlreadyJoinedException) {
                throw new WsRoomAlreadyJoinedException(roomCode, inviteUserId ?? user.id);
            }

            if (error instanceof UserNotFoundException) {
                throw new WsUserNotFoundException(inviteEmail);
            }

            throw error;
        }
    }

    async getRooms(page?: number) {
        const pagination = this.chatManager.normalizePage(page);
        const rooms = await this.chatRepository.findPublicRooms(pagination.skip, pagination.pageSize);

        return {
            rooms,
        };
    }

    async roomDetail(roomCode: string) {
        return this.chatManager.getRoomByCodeOrThrow(roomCode);
    }

    async message(user: Users, message: string) {
        const sanitizedMessage = this.chatManager.validateMessage(message);
        await this.chatRepository.createMessage(user.id, sanitizedMessage);
    }
}

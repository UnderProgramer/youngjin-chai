import { Injectable } from "@nestjs/common";
import { prismaClient } from "prisma/prisma.client";

@Injectable()
export class ChatRepository {
    constructor(private readonly prisma: prismaClient) {}

    async findRoomByCode(roomCode: string) {
        return this.prisma.room.findUnique({
            where: {
                room_code: roomCode,
            },
        });
    }

    async createRoom(data: {
        roomName: string;
        roomDescription: string;
        roomCode: string;
        userId: number;
        isPrivate: boolean;
    }) {
        return this.prisma.room.create({
            data: {
                room_name: data.roomName,
                room_code: data.roomCode,
                room_desc: data.roomDescription,
                userid: data.userId,
                is_privated: data.isPrivate,
            },
        });
    }

    async upsertJoinRoom(userId: number, roomCode: string) {
        return this.prisma.join_room.upsert({
            where: {
                userid_room_code: {
                    userid: userId,
                    room_code: roomCode,
                },
            },
            create: {
                room_code: roomCode,
                userid: userId,
            },
            update: {},
        });
    }

    async createJoinRoom(userId: number, roomCode: string) {
        return this.prisma.join_room.create({
            data: {
                room_code: roomCode,
                userid: userId,
            },
        });
    }

    async findJoinedUser(roomCode: string, userId: number) {
        return this.prisma.join_room.findFirst({
            where: {
                room_code: roomCode,
                userid: userId,
            },
        });
    }

    async findPublicRooms(skip: number, take: number) {
        return this.prisma.room.findMany({
            where: {
                is_privated: false,
            },
            take,
            skip,
            orderBy: {
                created_at: "asc",
            },
        });
    }

    async createMessage(userId: number, message: string) {
        return this.prisma.messages.create({
            data: {
                message,
                userid: userId,
            },
        });
    }
}

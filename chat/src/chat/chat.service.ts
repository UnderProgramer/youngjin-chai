import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateRoom } from "./dto/chat.create-room";
import { prismaClient } from "prisma/prisma.client";
import Hashids from 'hashids'
import { ConfigService } from "@nestjs/config";
import { Users } from "@prisma/client";

@Injectable()
export class ChatService {
    private hashids : Hashids
    private salt : string

    constructor(
        private prisma : prismaClient,
        private config : ConfigService

    ){
        this.salt = this.config.get<string>('ROOM_SALT')!
        this.hashids = new Hashids(this.salt, 8)
    }

    private generateRoomCode () {
        let result : string = ''
        const randomIndex : number = Math.random() * 8
        result = this.hashids.encode(randomIndex)

        return result
    }

    async createRoom(req : CreateRoom, user : Users) {
        const roomCode = this.generateRoomCode()

        await this.prisma.room.create({
            data : {
                room_name : req.roomName,
                room_code : roomCode,
                room_desc : req.roomDescription,
                userid    : user.id,
                is_privated : req.roomIsPrivate,
            }
        })
    }

    async joinRoom(roomCode : string, user : Users) {
        const room = await this.prisma.room.findUnique({
            where : {
                room_code : roomCode
            }
        })
        if (!room) {throw new BadRequestException('해당 방 코드는 존재 하지 않습니다.')}

        const joinRoom = await this.prisma.join_room.findFirst({
            where : {
                userid : user.id,
                room_code : roomCode
            }
        })

        if(joinRoom?.userid === user.id) {throw new ConflictException('이미 방에 참가한 유저 입니다.')}

        await this.prisma.join_room.create({
            data : {
                room_code : roomCode,
                userid : user.id,
            }
        })
    }

    async getRoom(page : number) {
        const pageSize = 8
        const skip = (page - 1) * pageSize

        const result = await this.prisma.room.findMany({
            where : {
                is_privated : false
            },
            take : pageSize,
            skip : skip,
            orderBy : {
                created_at : 'asc'
            }
        })

        return {
            rooms : result
        }
    }
}
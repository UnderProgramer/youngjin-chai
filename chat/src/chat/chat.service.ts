import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateRoom } from "./dto/chat.create-room";
import { prismaClient } from "prisma/prisma.client";
import Hashids from 'hashids'
import { ConfigService } from "@nestjs/config";
import { Users } from "@prisma/client";
import { UserNotFoundException } from "src/common/global/exception/custom-exceptions/http/UserNotFoundException";

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
        const randomIndex : number = Math.floor(Math.random() * 1_000_000)
        let result = this.hashids.encode(randomIndex)

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
        if (!room) { throw new BadRequestException('해당 방 코드는 존재 하지 않습니다.') }
        if (room.is_privated == true) {throw new BadRequestException('비공개 방입니다.')}

        const joinRoom = await this.prisma.join_room.findFirst({
            where : {
                userid : user.id,
                room_code : roomCode
            }
        })

        if(joinRoom?.userid === user.id) {
            throw new BadRequestException('이미 방에 참가 하셨습니다.')
        }

        await this.prisma.join_room.create({
            data : {
                room_code : roomCode,
                userid : user.id,
            }
        })
    }
    
    async invitePrivateRoom(roomCode: string, user: Users , inviteEmail: string ) {
        const room = await this.prisma.room.findUnique({
            where : {
                room_code : roomCode
            }
        })
        if (!room) { throw new BadRequestException('해당 방 코드는 존재 하지 않습니다.') }
       
        const inRoomUser = await this.prisma.join_room.findFirst({
            where: {
                room_code: roomCode,
                userid: user.id
            }
        })
        if(!inRoomUser) { throw new BadRequestException('방에 참가한 사람이 아닙니다.') }
        
        const inviteUser = await this.prisma.users.findUnique({
            where: {
                email: inviteEmail
            }
        })
        if(!inviteUser){ throw new BadRequestException('해당 유저를 찾을수 없습니다.') }
        
        const testJoinedUser = await this.prisma.join_room.findFirst({
            where: {
                room_code: roomCode,
                userid: inviteUser.id,
            }
        })

        if(testJoinedUser) { throw new BadRequestException('이미 방에 있는 유저 입니다') }
        await this.prisma.join_room.create({
                data:{
                    room_code: roomCode,
                    userid: inviteUser.id,
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

    async message(user: Users, message: string,) {
        if(!message) {
            return
        }

        await this.prisma.messages.create({
            data: {
                message : message,
                userid : user.id,
            }
        })
    }
}
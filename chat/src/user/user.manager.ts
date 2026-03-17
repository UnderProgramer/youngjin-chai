import { Injectable } from "@nestjs/common";
import { prismaClient } from "prisma/prisma.client";
import { UserNotFoundException } from "src/common/global/exception/custom-exceptions/http/UserNotFoundException";

@Injectable()
export class UserManager {
    constructor(
        private prisma : prismaClient
    ){}

    generateCode () {
        const pool = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let result : string = ''

        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length)
            result += pool[randomIndex]
        }

        return result
    }

    async findUserByEmail(email : string) {
            const user = await this.prisma.users.findUnique({
                where: {
                    email: email
                }
            })
    
            if(!user) {
                throw new UserNotFoundException("User not Found");
            }
            return user
    }

    
}
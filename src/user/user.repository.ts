import { Injectable } from "@nestjs/common";
import { prismaClient } from "../../prisma/prisma.client";
import { Prisma } from "@prisma/client";
import { UploadProfileRequest } from "./dto/upload-profile-request";

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: prismaClient) {}

    async findUserById(id: number) {
        return this.prisma.users.findUnique({
            where: { id },
        });
    }

    async findUserByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
        });
    }

    async createUser(data: Prisma.UsersCreateInput) {
        return this.prisma.users.create({
            data,
            select: {
                username: true,
                email: true,
            },
        });
    }

    async upsertVerifyCode(userId: number, code: string, expiredAt: Date) {
        return this.prisma.verify_code.upsert({
            where: {
                userid: userId,
            },
            create: {
                code,
                userid: userId,
                expired_at: expiredAt,
            },
            update: {
                code,
                expired_at: expiredAt,
            },
        });
    }

    async findLatestVerifyCodeByUserId(userId: number) {
        return this.prisma.verify_code.findFirst({
            where: {
                userid: userId,
            },
            orderBy: {
                created_at: "desc",
            },
        });
    }

    async markUserVerifiedByEmail(email: string) {
        return this.prisma.users.update({
            where: {
                email,
            },
            data: {
                is_verified: true,
            },
        });
    }

    async upsertLoginIp(userId: number, ip: string) {
        return this.prisma.ip.upsert({
            where: { userid: userId },
            create: {
                userid: userId,
                login_ip: ip,
            },
            update: {
                login_ip: ip,
            },
        });
    }

    async upsertRefreshToken(email: string, refreshToken: string, expiredAt: Date) {
        return this.prisma.refresh.upsert({
            where: { email },
            create: {
                email,
                refresh_token: refreshToken,
                expired_at: expiredAt,
            },
            update: {
                refresh_token: refreshToken,
                expired_at: expiredAt,
            },
        });
    }

    async findRefreshByToken(refreshToken: string) {
        return this.prisma.refresh.findUnique({
            where: {
                refresh_token: refreshToken,
            },
        });
    }

    async createReport(reporterId: number, reason: string) {
        return this.prisma.reports.create({
            data: {
                reporter: reporterId,
                reason,
            },
        });
    }

    async upsertProfilePicture(data : UploadProfileRequest) {
        return this.prisma.profilePicture.upsert({
            where: { userid : data.userId },
            create: {
                picture_name: data.pictureName,
                picture_url: data.pictureUrl,
                original_name: data.originalName,
                userid: data.userId,
                updated_at: data.updatedAt,
            },
            update: {
                picture_name: data.pictureName,
                picture_url: data.pictureUrl,
                original_name: data.originalName,
                updated_at: data.updatedAt,
            },
        })
    }

    async getProfilePictureByUserId(userId: number) {
        return this.prisma.profilePicture.findUnique({
            where: { userid: userId },
            select: {
                picture_url: true,
                original_name: true,
                updated_at: true,
            },
        });
    }
}

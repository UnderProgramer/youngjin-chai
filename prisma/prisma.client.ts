import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

@Injectable()
export class prismaClient extends PrismaClient implements OnModuleInit, OnModuleDestroy  {
    private static createConnectionString() {
        const connectionString = process.env.DATABASE_URL ?? "";

        if (
            connectionString.includes("sslmode=require") &&
            !connectionString.includes("uselibpqcompat=true") &&
            !connectionString.includes("sslmode=verify-full")
        ) {
            return connectionString.replace("sslmode=require", "sslmode=verify-full");
        }

        return connectionString;
    }

    // constructor() {
    //     const adapter = new PrismaMariaDb({
    //         host: process.env.DB_HOST!,
    //         port: Number(process.env.DB_PORT!),
    //         user: process.env.DB_USER!,
    //         password: process.env.DB_PASS!,
    //         database: process.env.DB_NAME!,
    //         connectionLimit: 5
    //     });

    //     super({
    //         adapter
    //     });
    // }

    constructor() {
        const pool = new pg.Pool({ connectionString: prismaClient.createConnectionString() })
        const adapter = new PrismaPg(pool)
        
        super({
            adapter : adapter
        })
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}

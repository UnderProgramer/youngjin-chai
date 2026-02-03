import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import { emailOption } from "./types/type.email";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private gmail: string | undefined;
    private password: string | undefined;

    constructor(private readonly config : ConfigService) {
        this.gmail = this.config.get<string>('GOOGLE_GMAIL');
        this.password = this.config.get<string>('GOOGLE_PASS')

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth : {
                user : this.gmail,
                pass : this.password,
            }
        })
    }

    async sendEmailMessage(email : string, code ?: string) {
        const emailOptions : emailOption = {
            from : this.gmail!,
            to : email,
            subject : 'Verify Your Email',
            html : `
                    <h1>Is this your email?</h1><br>
                    <h2><p>Code : ${code}</p></h2>
                   `
        }
        try {
            return await this.transporter.sendMail(emailOptions)
        } catch (e){
            throw new BadRequestException(`[ERROR] : ${e}`)
        }
    }
}

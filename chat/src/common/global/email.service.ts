import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import { emailOption } from "./types/type.email";

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth : {
                user : 'jojokokoimo@gmail.com',
                pass : 'ihma ixmy ufwk uzkt',
            }
        })
    }

    async sendEmailMessage(email : string, code ?: string) {
        const emailOptions : emailOption = {
            from : 'jojokokoimo@gmail.com',
            to : email,
            subject : 'Verify Your Email',
            html : `
                    <h1>Is this your email?</h1><br>
                    <p>Code : ${code}</p>
                   `
        }
        try {
            return await this.transporter.sendMail(emailOptions)
        } catch (e){
            throw new BadRequestException(`[ERROR] : ${e}`)
        }
    }
}

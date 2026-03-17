import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Users } from '@prisma/client'
import axios from 'axios'

@Injectable()
export class DiscordService {
    constructor(private readonly config : ConfigService){}

    errorLogger = (status : number, message : string, path : string) => {
        const errWebhook = this.config.get<string>('ERROR_WEBHOOK')
        
        axios.post(errWebhook!, {
            embeds: [
                {
                    title: '🚨 Server Error',
                    color: 0xff0000,
                    fields: [
                        { name: 'Status', value: status, inline: true },
                        { name: 'Message', value: message, inline: true },
                        { name: 'Path', value: path }
                    ]
                }
            ]
        })
    }

    WsErrorLogger = (message : string) => {
        const errWebhook = this.config.get<string>('ERROR_WEBHOOK')
        
        axios.post(errWebhook!, {
            embeds: [
                {
                    title: '🚨 Ws-Server Error',
                    color: 0xff0000,
                    fields: [
                        { name: 'Message', value: message, inline: true },
                    ]
                }
            ]
        })
    }

    reportLogger = (user : Users, reason : string) => {
        const reportWebhook = this.config.get<string>('REPORT_WEBHOOK')
        
        axios.post(reportWebhook!, {
            embeds: [
                {
                    title: '🚨 User Report',
                    color: 0xff0000,
                    fields: [
                        { name: 'reporter', value: user.email, inline: true },
                        { name: 'reason', value: reason, inline: true },
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        })
    }
}
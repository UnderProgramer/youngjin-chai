import { Injectable, OnModuleInit } from "@nestjs/common";
import * as mediasoup from 'mediasoup';
import * as os from 'os'

import { workersType, mediaCodecs } from "./types/config.mediasoup";

@Injectable()
export class MediasoupService implements OnModuleInit{
    private nextWorkerIndex = 0;

    private workers: workersType[] = [];
    private routers = new Map<string, mediasoup.types.Router>();

    public async onModuleInit() {
        const numWorkers = os.cpus().length;
        
        for (let i = 0; i < numWorkers; ++i) {
            this.createWorker(i)
        }
    }

    async createWorker(numOfWorker : number) {
        const worker = await mediasoup.createWorker({
            rtcMinPort: 10000 + numOfWorker * 1000,
            rtcMaxPort: 10999 + numOfWorker * 1000,
        });

        worker.on('died', () => {
            console.error('mediasoup worker has died');
            setTimeout(() => process.exit(1), 2000);
        })

        this.workers.push({ 
            id: numOfWorker,
            worker,
            routers: new Map() 
        });

        return worker;
    }

    public getWorker() {
        const worker = this.workers[this.nextWorkerIndex];
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length
        return worker
    }

    async getRouter(roomId: string) {
        for (const worker of this.workers) {
            if (worker.routers.has(roomId)) {
                return worker.routers.get(roomId);
            }
        }

        const worker = this.getWorker();
                
        const router = await worker.worker.createRouter({ mediaCodecs: mediaCodecs });
        
        worker.routers.set(roomId, router)
        
        return router;
    }
}
import { Injectable, OnModuleInit } from "@nestjs/common";
import * as mediasoup from 'mediasoup';
import * as os from 'os'

import { workersType, mediaCodecs } from "./types/config.mediasoup";

@Injectable()
export class MediasoupService implements OnModuleInit{
    private nextWorkerIndex = 0;

    private workers: workersType[] = [];

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
            logLevel: 'warn'
        });

        worker.on('died', () => {
            console.error('mediasoup worker has died');
            setTimeout(() => this.createWorker(numOfWorker), 2000);
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

     // 핵심 추가 부분
    async getPipedRouter(roomId: string, targetWorkerIndex: number) {
        const sourceRouter = await this.getRouter(roomId);
        const targetWorker = this.workers[targetWorkerIndex];

        // 이미 pipe된 router가 있으면 재사용
        const pipedRoomId = `${roomId}-piped-${targetWorkerIndex}`;
        if (targetWorker.routers.has(pipedRoomId)) {
            return targetWorker.routers.get(pipedRoomId);
        }

        // 새 router 만들고 pipe 연결
        const targetRouter = await targetWorker.worker.createRouter({ mediaCodecs });
        targetWorker.routers.set(pipedRoomId, targetRouter);

        await sourceRouter!.pipeToRouter({
            producerId: undefined as any, // producer 생길 때마다 pipe
            router: targetRouter,
        });

        return targetRouter;
    }

    // worker 부하 확인해서 가장 여유있는 worker 반환
    async getLeastLoadedWorker() {
        const usages = await Promise.all(
            this.workers.map(async (w) => ({
                worker: w,
                usage: await w.worker.getResourceUsage(),
            }))
        );

        return usages.reduce((min, cur) =>
            cur.usage.ru_utime < min.usage.ru_utime ? cur : min
        ).worker;
    }
}
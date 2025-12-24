import * as mediasoup from 'mediasoup'

export interface workersType {
    id: number
    worker: mediasoup.types.Worker
    routers: Map<string, mediasoup.types.Router>
}

export const mediaCodecs : mediasoup.types.RtpCodecCapability[] = [
        {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
            preferredPayloadType: 111
        },
        {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            preferredPayloadType: 96
        },
        {
            kind: 'video',
            mimeType: 'video/H264',
            clockRate: 90000,
            parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            },
            preferredPayloadType: 96
        },
    ];
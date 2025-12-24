import * as mediasoup from 'mediasoup'

export interface TransportType {
    readonly id : string
    readonly transport : mediasoup.types.WebRtcTransport
    readonly direction : 'send' | 'recv'
    readonly peerId : string
    readonly roomId : string
}
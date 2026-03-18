import * as mediasoup from 'mediasoup'
import { types } from 'mediasoup'

export interface TransportType {
    readonly id : string
    readonly transport : mediasoup.types.WebRtcTransport
    readonly direction : 'send' | 'recv'
    readonly peerId : string
    readonly roomId : string
}

export interface CreateTransportType {
    readonly peerId : string
    readonly direction : 'send' | 'recv'
}

export interface CreateProduce {
    readonly transportId: string
    readonly kind : mediasoup.types.MediaKind
    readonly rtpParameters : mediasoup.types.RtpParameters
    readonly mediaTag : 'camera' | 'screen' | 'mic'
}

export interface Peer {
    peerId : string;
    roomId : string;
    userId : string;
    sendTransport: Map<string, types.WebRtcTransport>;
    recvTransport:Map<string, types.WebRtcTransport>
    producers: Map<string, types.Producer>;
    consumers : Map<string, mediasoup.types.Consumer>;
}

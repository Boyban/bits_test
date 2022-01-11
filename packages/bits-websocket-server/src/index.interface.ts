import WebSocket from "ws";

export interface CustomWebSocket extends WebSocket {
    id: string;
}

export interface Auction {
    started: boolean,
    endDate?: Date,
    item: {
        name: string;
        actualPrice: number;
        startingPrice: number;
    }
    timeoutFn?: () => void,
    lastBid?: {
        wsId: string;
        value: number;
        date: Date;
    }
}

export enum WEBSOCKET_MESSAGE_TYPE {
    BID = "BID",
    AUCTION = "AUCTION"
}

export interface WebSocketMessage {
    type: WEBSOCKET_MESSAGE_TYPE,
    metadata: any;
}
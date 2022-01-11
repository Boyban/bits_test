import {WebSocketServer} from 'ws';
import * as http from "http";
import {nanoid} from "nanoid";
import {Auction, CustomWebSocket, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage} from "./index.interface";
import {client} from "websocket";

let httpServer = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

let wss = new WebSocketServer({
    server: httpServer
});


const auction: Auction = {
    terminated: false,
    started: false,
    item: {
        name: 'Carte Pokémon',
        startingPrice: 1,
        actualPrice: 1
    }
}

function diff_seconds(date2: Date, date1: Date): number {
    let diff =(date2.getTime() - date1.getTime()) / 1000;
    return Math.abs(Math.round(diff));
}

function broadcast_auction() {
    // @ts-ignore
    wss.clients.forEach(function each(client: CustomWebSocket) {
        client.send(JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.AUCTION,
            metadata: auction
        }))
    });
}

setInterval(() => {
    const date = new Date();

    if (auction.endDate && date > auction.endDate) {
        auction.terminated = true;
        broadcast_auction();
        // @ts-ignore
        wss.clients.forEach(function each(client: CustomWebSocket) {
            if (client.id === auction.lastBid?.wsId) {
                client.send(JSON.stringify({
                    type: WEBSOCKET_MESSAGE_TYPE.WIN,
                }))
            }
        })
    }
}, 1000)

/** Websocket logic **/
wss.on("connection", function connection(ws: CustomWebSocket, req) {
    ws.id = nanoid();

    ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPE.AUCTION,
        metadata: auction
    }))

    ws.on('message', function message(data: any) {
        const date = new Date();
        const message: WebSocketMessage = JSON.parse(data);

        if (message.type === WEBSOCKET_MESSAGE_TYPE.BID && message.metadata.value > auction.item.actualPrice) {
            auction.lastBid = {
                wsId: ws.id,
                date,
                value: message.metadata.value
            }

            auction.item.actualPrice = message.metadata.value;

            if (auction.endDate && diff_seconds(auction.endDate, date) < 15) {
                date.setSeconds(date.getSeconds() + 15);
                auction.endDate = date;
            }
            broadcast_auction();
        }
    });

    if (!auction.started) {
        const endDate = new Date();

        endDate.setMinutes(endDate.getMinutes() + 1);
        auction.started = true;
        auction.endDate = endDate;
        broadcast_auction();
    }
});

httpServer.listen(8080, () => {
    console.log('Server listening on port 8080')
})

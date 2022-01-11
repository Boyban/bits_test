import WebSocket, { WebSocketServer } from 'ws';
import * as http from "http";
import {nanoid} from "nanoid";
import {Auction, CustomWebSocket, WEBSOCKET_MESSAGE_TYPE} from "./index.interface";

let httpServer = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

let wss = new WebSocketServer({
    server: httpServer
});


const auction: Auction = {
    started: false,
    item: {
        name: 'Carte Pokémon',
        startingPrice: 1,
        actualPrice: 1
    }
}


/** Websocket logic **/
wss.on("connection", function connection(ws: CustomWebSocket, req) {
    ws.id = nanoid();

    ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPE.AUCTION,
        metadata: auction
    }))

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    if (!auction.started) {
        const endDate = new Date();

        endDate.setMinutes(endDate.getMinutes() + 1);
        auction.started = true;
        auction.endDate = endDate;
    }

    // @ts-ignore
    // wss.clients.forEach(function each(client: CustomWebSocket) {
    //     console.log('Client.ID: ' + client.id);
    // });
});

httpServer.listen(8080, () => {
    console.log('Server listening on port 8080')
})

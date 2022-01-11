import React, {useEffect, useRef, useState} from 'react';
import './App.scss';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import ReactHlsPlayer from 'react-hls-player';
import {Auction, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage} from "./websocket.interface";


function App() {
  const [auction, setAuction] = useState<Auction>({
    started: false,
    item: {
      name: 'Chargement...',
      actualPrice: 1,
      startingPrice: 1,
    }
  })
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');
  const [messageHistory, setMessageHistory] = useState<any>([]);
  const playerRef = useRef<any>();

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      if (lastMessage.data) {
        const data: WebSocketMessage = JSON.parse(lastMessage.data);

        if (data.type === WEBSOCKET_MESSAGE_TYPE.AUCTION)
          setAuction(data.metadata);
      }
      setMessageHistory((prev: any) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  // @ts-ignore
  return (
    <div className="App">
      <div className="player">
        <ReactHlsPlayer
            playerRef={playerRef}
            src="https://stream.mux.com/02cDqggWRQ2GkJskapoOW2OZq7I4NGL2y8aFApetXkBA.m3u8"
            autoPlay={false}
            controls={false}
            width="100%"
            height="100%"
        />
      </div>

      <div className="layout">
        <div className="container">
          <div />
          <div className="bottom-content">
            <div className="bids">
              <div className="bid">
                { auction.item.actualPrice + 1 }€
              </div>
              <div className="bid">
                { auction.item.actualPrice + 2 }€

              </div>
              <div className="bid">
                { auction.item.actualPrice + 3 }€
              </div>
            </div>
            <div className="controls">
              <div className="header">
                <div className="controls_header__left">
                  { auction.item.name }
                </div>
                <div className="controls_header__right">
                  { auction.item.actualPrice }€
                </div>
              </div>

              <div className="countdown">
                43s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

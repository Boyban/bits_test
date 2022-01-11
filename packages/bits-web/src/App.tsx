import React, {useEffect, useRef, useState} from 'react';
import './App.scss';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import ReactHlsPlayer from 'react-hls-player';
import {Auction, WEBSOCKET_MESSAGE_TYPE, WebSocketMessage} from "./websocket.interface";


function App() {
  const [auction, setAuction] = useState<Auction>({
    started: false,
    terminated: false,
    item: {
      name: 'Chargement...',
      actualPrice: 1,
      startingPrice: 1,
    }
  })
  const [isWin, setIsWin] = useState(false);
  const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');
  const [messageHistory, setMessageHistory] = useState<any>([]);
  const playerRef = useRef<any>();
  const [countdown, setCountdown] = useState(0);
  const [isCustomBid, setIsCustomBid] = useState<boolean>(false);
  const [bidInput, setBidInput] = useState(0);

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      if (lastMessage.data) {
        const data: WebSocketMessage = JSON.parse(lastMessage.data);

        if (data.type === WEBSOCKET_MESSAGE_TYPE.AUCTION) {
          setAuction(data.metadata);
          setBidInput(data.metadata.item.actualPrice + 3)
        }

        if (data.type === WEBSOCKET_MESSAGE_TYPE.WIN)
          setIsWin(true);
      }
      setMessageHistory((prev: any) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const addABid = (value: number) => {
    sendMessage(JSON.stringify(
        {
          type: WEBSOCKET_MESSAGE_TYPE.BID,
          metadata: {
            value
          }
        }
    ))
  }

  let timer: any = null;
  useEffect(() => {
    if (timer)
      clearInterval(timer);
    timer = setInterval(() => {
      if (!auction.endDate)
        return;
      const date = new Date();
      const endDate = new Date(auction.endDate);

      let difference = Math.abs((endDate.getTime() - date.getTime()) / 1000);
      setCountdown(difference)
    }, 1000)

    return () => {
      if (timer) clearInterval(timer);
    }
  }, [auction])

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
            {
              auction.started && !auction.terminated &&
                <div className="bids">
                  <div className="bid" onClick={() => addABid( auction.item.actualPrice + 1 )}>
                    { auction.item.actualPrice + 1 }€
                  </div>
                  <div className="bid" onClick={() => addABid( auction.item.actualPrice + 2 )}>
                    { auction.item.actualPrice + 2 }€

                  </div>
                  {
                    !isCustomBid && <div className="bid" onClick={() => setIsCustomBid(true)}>
                        Autre
                      </div>
                  }

                  {
                    isCustomBid && <div className="bid custom-bid">
                        <input type="number" value={bidInput} onChange={(e) => setBidInput(Number(e.target.value)) }/>
                        <button onClick={() => {
                          addABid(Number(bidInput));
                          setIsCustomBid(false)
                        }}>Go</button>
                      </div>
                  }
                </div>
            }

            {isWin && <div className="win">
              Vous avez remporté cette enchère pour {auction.item.actualPrice}€
            </div>}

            {
              auction.started && !auction.terminated &&
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
                    {countdown.toFixed(0)}s
                  </div>
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

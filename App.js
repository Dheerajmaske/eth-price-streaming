import React, { useEffect, useState } from "react";

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 5; // Maximum number of retries

  useEffect(() => {
    const connectWebSocket = () => {
      // WebSocket endpoint and token
      const url = "wss://streaming.bitquery.io/graphql?token=ory_at_MxiHNgvdZLMovayda44GDGwgm9bFbraVK1AyqJGVMfM.xHzrpgVHxEGxIC_pJkVwX_dFn8EstrNDcbc92qU50gQ";
      
      // Create a new WebSocket instance
      const ws = new WebSocket(url);

      // Handle WebSocket open event
      ws.onopen = () => {
        setIsConnected(true);
        setRetryCount(0); // Reset retry count on successful connection
        console.log("Connected to Bitquery.");
        
        // Send initialization message
        const initMessage = JSON.stringify({ type: "connection_init" });
        ws.send(initMessage);

        // Send the actual subscription message
        setTimeout(() => {
          const message = JSON.stringify({
            type: "start",
            id: "1",
            payload: {
              query: `
subscription {
  Solana {
    DEXTrades(
      where: {Trade: {Dex: {ProgramAddress: {is: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"}}}}
    ) {
      Trade {
        Dex {
          ProgramAddress
          ProtocolFamily
          ProtocolName
        }
        Buy {
          Account {
            Address
          }
          Amount
          Currency {
            MintAddress
            Decimals
            Symbol
            ProgramAddress
            Name
          }
          PriceAgaistSellCurrency: Price
        }
        Sell {
          Account {
            Address
          }
          Amount
          Currency {
            MintAddress
            Decimals
            Symbol
            Name
          }
          PriceAgaistBuyCurrency: Price
        }
      }
      Block {
        Time
        Height
      }
      Transaction {
        Signature
        FeePayer
        Signer
      }
    }
  }
}
              `,
            },
          });
          ws.send(message);
        }, 1000);
      };

      // Handle incoming messages
      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.type === "data") {
          setData(response.payload.data);
          console.log("Received data from Bitquery:", response.payload.data);
        }
      };

      // Handle WebSocket close event
      ws.onclose = () => {
        setIsConnected(false);
        console.log("Disconnected from Bitquery.");
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          setTimeout(connectWebSocket, 2000); // Retry connection after a delay
        } else {
          setError("Max retry attempts reached. Could not connect to Bitquery.");
        }
      };

      // Handle WebSocket error event
      ws.onerror = (event) => {
        console.error("WebSocket Error:", event);
        setError("WebSocket error occurred. See console for details.");
      };

      // Cleanup WebSocket connection on component unmount
      return () => {
        ws.close();
      };
    };

    connectWebSocket();
  }, [retryCount]);

  return (
    <div>
      <h1>Bitquery WebSocket</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      {error && <p>Error: {error}</p>}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;

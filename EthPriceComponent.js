import React from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

class EthPriceComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { EthIndexThrolled: undefined };
    this.EthIndex = undefined;
  }

  establishWebSocketConnection = () => {
    const wsOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      connectionTimeout: 5000,
      minUptime: 5000,
      maxRetries: 999999999999,
      reconnectionDelayGrowFactor: 1.3,
      debug: false,
    };

    const url = 'wss://streaming.bitquery.io/graphql';
    const wsClient = new ReconnectingWebSocket(url, [], wsOptions);

    wsClient.addEventListener('open', () => {
      console.log('Connection Established ...');
    });

    wsClient.addEventListener('message', (e) => {
      let dataFromServer = JSON.parse(e.data);
      if (dataFromServer.type === 'ethspot') {
        this.EthIndex = dataFromServer.values.index;
      }
      console.log(dataFromServer);
    });
  };

  componentDidMount() {
    this.establishWebSocketConnection();
    this.interval = setInterval(() => {
      this.setState({ EthIndexThrolled: this.EthIndex });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        <h1>Real-Time Ethereum Spot Index: {this.state.EthIndexThrolled}</h1>
      </div>
    );
  }
}

export default EthPriceComponent;

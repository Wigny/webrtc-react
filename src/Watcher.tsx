import React from 'react';
import './App.css';
import { io } from "socket.io-client"

const socket = io("https://serverrtc.herokuapp.com/")

const config: RTCConfiguration = {
  iceServers: [{
    urls: ['stun:stun.l.google.com:19302']
  }]
};

class Watcher extends React.Component {
  private videoRef: React.RefObject<HTMLVideoElement>;
  private connection: RTCPeerConnection;

  constructor(props: {}) {
    super(props);
    this.videoRef = React.createRef();
    this.connection = new RTCPeerConnection(config);
  }

  componentDidMount() {
    socket.on('offer', (id: any, description: RTCSessionDescriptionInit) => {

      this.connection
        .setRemoteDescription(description)
        .then(() => this.connection.createAnswer())
        .then(sdp => this.connection.setLocalDescription(sdp))
        .then(() => socket.emit('answer', id, this.connection.localDescription));

      this.connection.ontrack = ({ streams }) => this.videoRef.current!.srcObject = streams[0];

      this.connection.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('candidate', id, candidate);
        }
      };
    });

    socket.on('candidate', (_id: string, candidate: RTCIceCandidateInit) => this.connection
      .addIceCandidate(candidate)
      .catch(console.error)
    );

    socket.on('connect', () => socket.emit('watcher'));

    socket.on('broadcaster', () => socket.emit('watcher'));

    socket.on('disconnectPeer', () => this.connection.close());
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <video ref={this.videoRef} playsInline autoPlay ></video>
          <p>Watcher</p>
        </header>
      </div>
    );
  }
}

export default Watcher;

import React from 'react';
import './App.css';
import { io } from "socket.io-client"

const socket = io("https://serverrtc.herokuapp.com/")

const config: RTCConfiguration = {
  iceServers: [{
    urls: ['stun:stun.l.google.com:19302']
  }]
};

class Broadcaster extends React.Component {
  private videoRef: React.RefObject<HTMLVideoElement>;
  private connections: { id: string, peer: RTCPeerConnection }[];

  constructor(props: {}) {
    super(props);
    this.videoRef = React.createRef();
    this.connections = [];
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.videoRef.current!.srcObject = stream
        socket.emit('broadcaster');
      })
      .catch(console.error);

    socket.on('watcher', (id: string) => {
      const peer = new RTCPeerConnection(config);

      const stream = this.videoRef.current!.srcObject as MediaStream;

      stream
        .getTracks()
        .forEach(track => peer.addTrack(track, stream));

      peer.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('candidate', id, candidate);
        }
      };

      peer
        .createOffer()
        .then(sdp => peer.setLocalDescription(sdp))
        .then(() => socket.emit('offer', id, peer.localDescription));

      this.connections.push({ id, peer });
    });

    socket.on('answer', (id: string, description: RTCSessionDescriptionInit) => {
      const connection = this.connections.find(c => c.id === id);
      connection?.peer.setRemoteDescription(description);
    });

    socket.on('candidate', (id: string, candidate: RTCIceCandidateInit) => {
      const connection = this.connections.find(c => c.id === id);
      connection?.peer.addIceCandidate(candidate)
    });

    socket.on('disconnectPeer', (id: string) => {
      const connection = this.connections.find(c => c.id === id);
      connection?.peer.close();
      this.connections = this.connections.filter(c => c.id !== id)
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <video ref={this.videoRef} playsInline autoPlay muted></video>
          <p>Broadcaster</p>
        </header>
      </div>
    );
  }
}

export default Broadcaster;

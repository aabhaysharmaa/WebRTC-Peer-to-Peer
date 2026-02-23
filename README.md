
🚀 **Just built a WebRTC Video Calling App from scratch!**

Excited to share that I recently built a real-time **1-on-1 audio & video calling application** using **WebRTC** and **Agora RTM** for signaling!

Here's what's under the hood:

🔧 **Tech Stack & Features:**
- **WebRTC** for peer-to-peer video/audio streaming
- **Agora RTM SDK** for signaling (offer/answer/ICE candidate exchange)
- **STUN servers** for NAT traversal
- HD video support (up to 1080p @ 30fps)
- High-quality audio with echo cancellation & noise suppression
- Toggle camera & mic on the fly
- Auto-redirect to lobby if no room is found

💡 **How it works:**
When a user joins a room, an **RTCPeerConnection** is established. Offers, answers, and ICE candidates are exchanged through Agora's real-time messaging, creating a seamless peer-to-peer connection — no media goes through a central server!

This was a great deep dive into how modern video communication actually works at the protocol level. Understanding SDP, ICE negotiation, and media tracks gave me a whole new appreciation for tools like Zoom and Google Meet.

🔜 **What's next?**
I'm planning to extend this into a **Group Video Call** feature — a completely different challenge involving mesh networks or SFU (Selective Forwarding Unit) architecture. Stay tuned! 👀

If you're curious about WebRTC or want to collaborate, feel free to connect!


let APP_ID = "6d8238e473664c1986e7557d8fde69c6";
let token = null;
let uid = String(Math.floor(Math.random() * 10000));

let client;
let channel;

let queryString = window.location.search
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
	window.location = `lobby.html`
}

let localStream;
let remoteStream;
let peerConnection;

const servers = {
	iceServers: [
		{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }
	]
}

let constraints = {
	video: {
		width: { min: 640, ideal: 1920, max: 1920 },
		height: { min: 480, ideal: 1080, max: 1920 },
	}
}
const init = async () => {

	client = await AgoraRTM.createInstance(APP_ID);
	await client.login({ uid, token })

	channel = client.createChannel(roomId);
	await channel.join();

	channel.on("MemberJoined", handleUserJoined)
	channel.on("MemberLeft", handleUserLeft)
	client.on("MessageFromPeer", handleMessageFromPeer)

	localStream = await navigator.mediaDevices.getUserMedia({
		video: {
			width: { ideal: 1920 },
			height: { ideal: 1080 },
			frameRate: { ideal: 30, max: 30 }
		}, audio: {
			echoCancellation: true,
			noiseSuppression: true,
			autoGainControl: true,
			channelCount: 2,
			sampleRate: 48000,
			sampleSize: 16
		}
	})
	document.getElementById("user-1").srcObject = localStream
}

let handleUserLeft = (memberId) => {
	document.getElementById("user-2").style.display = "none";
	document.getElementById("user-1").classList.remove("smallFrame")
}

let handleUserJoined = async (memberId) => {
	console.log("A New user joined the channel", memberId)
	createOffer(memberId);
}


let createPeerConnection = async (memberId) => {
	peerConnection = new RTCPeerConnection({
		...servers,
		sdpSemantics: "unified-plan"
	});

	remoteStream = new MediaStream();
	document.getElementById("user-2").srcObject = remoteStream
	document.getElementById("user-2").style.display = "block"

	document.getElementById("user-1").classList.add("smallFrame")

	if (!localStream) {
		localStream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: { ideal: 1920 },
				height: { ideal: 1080 },
				frameRate: { ideal: 30, max: 30 }
			}, audio: {
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true,
				channelCount: 2,
				sampleRate: 48000,
				sampleSize: 16
			}
		})
		document.getElementById("user-1").srcObject = localStream
	}

	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, localStream)
	});

	peerConnection.ontrack = (event) => {
		event.streams[0].getTracks().forEach((track) => {
			remoteStream.addTrack(track)
		})
	}

	peerConnection.onicecandidate = async (event) => {
		if (event.candidate) {
			// channel.sendMessage({ text: JSON.stringify({ type: "candidate", candidate: event.candidate }) });
			client.sendMessageToPeer({ text: JSON.stringify({ "type": "candidate", "candidate": event.candidate }) }, memberId)

		}
	}
}

let handleMessageFromPeer = async (message, memberId) => {
	message = JSON.parse(message.text);
	if (message.type === "offer") {
		createAnswer(memberId, message.offer)
	}
	if (message.type === "answer") {
		addAnswer(message.answer)
	}
	if (message.type === "candidate") {
		if (peerConnection) {
			peerConnection.addIceCandidate(message.candidate)
		}
	}
}

let createOffer = async (memberId) => {
	await createPeerConnection(memberId)

	let offer = await peerConnection.createOffer();
	await peerConnection.setLocalDescription(offer);
	client.sendMessageToPeer({ text: JSON.stringify({ "type": "offer", "offer": offer }) }, memberId)

	console.log("Offer :", offer)
}

let createAnswer = async (memberId, offer) => {
	await createPeerConnection(memberId);

	await peerConnection.setRemoteDescription(offer);

	let answer = await peerConnection.createAnswer();
	await peerConnection.setLocalDescription(answer);

	client.sendMessageToPeer({ text: JSON.stringify({ "type": "answer", "answer": answer }) }, memberId)

}

let addAnswer = async (answer) => {
	if (!peerConnection.currentRemoteDescription) {
		peerConnection.setRemoteDescription(answer);
	}
}

let leaveChannel = async () => {
	await channel.leave();
	await client.logout();

}

let toggleCamera = async () => {
	console.log("Clicking...")
	let videoTrack = localStream.getTracks().find((track) => track.kind === "video")

	if (videoTrack.enabled) {
		videoTrack.enabled = false
		document.getElementById("camera-btn").style.backgroundColor = `rgb(255,80,80)`
	} else {
		videoTrack.enabled = true
		document.getElementById("camera-btn").style.backgroundColor = `rgb(179,102,249)`
	}
}

let toggleMic = async () => {
	let audioTrack = localStream.getTracks().find((track) => track.kind === "audio");
	if (audioTrack.enabled) {
		audioTrack.enabled = false;
		document.getElementById("mic-btn").style.background = `rgb(255,80,80)`;
	} else {
		audioTrack.enabled = true
		document.getElementById("mic-btn").style.background = `rgb(179,102,249)`

	}
}

document.getElementById("camera-btn").addEventListener("click", toggleCamera)
document.getElementById("mic-btn").addEventListener("click", toggleMic)
window.addEventListener("beforeunload", leaveChannel)
init();
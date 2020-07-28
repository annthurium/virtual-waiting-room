let room;

const joinRoom = async (event, identity) => {
  const response = await fetch(`/token?identity=${identity}`);
  const jsonResponse = await response.json();
  const token = jsonResponse.token;

  const Video = Twilio.Video;

  const localTracks = await Video.createLocalTracks({
    audio: true,
    video: { width: 640 },
  });
  try {
    room = await Video.connect(token, {
      name: "telemedicineAppointment",
      tracks: localTracks,
    });
  } catch (error) {
    console.log(error);
  }

  // display your own video element in DOM
  // localParticipants are handled differently
  // you don't need to fetch your own video/audio streams from the server
  const localMediaContainer = document.getElementById("local-media-container");
  localTracks.forEach((localTrack) => {
    localMediaContainer.appendChild(localTrack.attach());
  });

  // display video/audio of other participants who have already joined
  room.participants.forEach(onParticipantConnected);

  // subscribe to new participant joining event so we can display their video/audio
  room.on("participantConnected", onParticipantConnected);

  room.on("participantDisconnected", onParticipantDisconnected);

  toggleButtons();

  event.preventDefault();
};

// when a participant disconnects, remove their video and audio from the DOM.
const onParticipantDisconnected = (participant) => {
  const participantDiv = document.getElementById(participant.sid);
  participantDiv.parentNode.removeChild(participantDiv);
};

const onParticipantConnected = (participant) => {
  const participantDiv = document.createElement("div");
  participantDiv.id = participant.sid;

  // when a remote participant joins, add their audio and video to the DOM
  const trackSubscribed = (track) => {
    participantDiv.appendChild(track.attach());
  };
  participant.on("trackSubscribed", trackSubscribed);

  participant.tracks.forEach((publication) => {
    if (publication.isSubscribed) {
      trackSubscribed(publication.track);
    }
  });

  document.body.appendChild(participantDiv);

  const trackUnsubscribed = (track) => {
    track.detach().forEach((element) => element.remove());
  };

  participant.on("trackUnsubscribed", trackUnsubscribed);
};

const onLeaveButtonClick = (event) => {
  room.localParticipant.tracks.forEach((publication) => {
    const track = publication.track;
    // stop releases the media element from the browser control
    // which is useful to turn off the camera light, etc.
    track.stop();
    const elements = track.detach();
    elements.forEach((element) => element.remove());
  });
  room.disconnect();

  toggleButtons();
};

const toggleButtons = () => {
  document.getElementById("leave-button").classList.toggle("hidden");
  document.getElementById("join-button").classList.toggle("hidden");
};

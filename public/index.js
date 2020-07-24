let room;

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

  const mediaContainer = document.getElementById("media-container");
  document.body.appendChild(participantDiv);

  const trackUnsubscribed = (track) => {
    track.detach().forEach((element) => element.remove());
  };

  participant.on("trackUnsubscribed", trackUnsubscribed);
};

const onJoinButtonClick = async (event, identity) => {
  const r = Math.floor(Math.random() * Math.floor(300)).toString();
  // todo: wrap this in a try/catch
  const response = await fetch(`/token?identity=${identity}`);
  const jsonResponse = await response.json();
  const token = jsonResponse.token;

  const Video = Twilio.Video;

  // do I need to create a local audio track too??
  // probably
  const localTrack = await Video.createLocalVideoTrack();
  room = await Video.connect(token, {
    name: "telemedicineAppointment",
    tracks: [localTrack],
  });

  // display your own video element in DOM
  // localParticipants are handled differently
  // you don't need to fetch your own video/audio streams from the server
  const localMediaContainer = document.getElementById("local-media-container");
  localMediaContainer.appendChild(localTrack.attach());

  // display video/audio of other participants who have already joined
  room.participants.forEach(onParticipantConnected);

  // subscribe to new participant joining event so we can display their video/audio
  room.on("participantConnected", onParticipantConnected);

  room.on("participantDisconnected", onParticipantDisconnected);

  // maybe make this a helper function?
  event.target.classList.toggle("hidden");
  document.getElementById("leave-button").classList.toggle("hidden");

  // TODO:
  // make the audio not be terrible
  // add a button for previewing your audio and video?
  event.preventDefault();
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

  event.target.classList.toggle("hidden");
  const joinButton = document.getElementById("join-button");
  joinButton.classList.toggle("hidden");
};

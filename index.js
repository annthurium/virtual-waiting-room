/* TODO:
 - allow the patient to join
 - implement some sort of soothing "waiting" experience if the doctor is not already in the room
 - explore that templating API in vanilla JS to avoid duplicating HTML
 - clean up JS so that you're using consistent APIs for defining functions etc
*/

const bodyParser = require("body-parser");
const http = require("http");
const express = require("express");
const path = require("path");
const app = express();

const twilio = require("twilio");
const client = twilio();
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const ROOM_NAME = "telemedicineAppointment";

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
// TODO: is this strictly necessary?
const MAX_ALLOWED_SESSION_DURATION = 14400;

const patientPath = path.join(__dirname, "./public/patient.html");
app.use("/patient", express.static(patientPath));

const providerPath = path.join(__dirname, "./public/provider.html");
app.use("/provider", express.static(providerPath));

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.post("/create", function (request, response) {
  client.video.rooms
    .create({
      statusCallback: "http://32bb77edb9ae.ngrok.io/status-callback",
      type: "group",
      uniqueName: ROOM_NAME,
    })
    .then((room) => console.log("room created", room.sid));
  console.log("created a room");
  response.sendStatus(200);
});

app.post("/status-callback", function (request, response) {
  console.log("status-callback request", request.body);
  response.sendStatus(200);
});

app.get("/token", function (request, response) {
  const identity = request.query.identity || "tilde";

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { ttl: MAX_ALLOWED_SESSION_DURATION }
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  // TODO: make this a const and import it?
  const grant = new VideoGrant({ room: ROOM_NAME });
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt(),
  });
});

http.createServer(app).listen(1337, () => {
  console.log("express server listening on port 1337");
});

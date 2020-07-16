/* TODO:
 - add a route for the provider view
 - add html page for the provider view
 - add html form to join the video conference
 - fire off some sort of event when the provider joins, so that we can also join the patient
 - maybe using status callbacks? https://www.twilio.com/docs/video/api/status-callbacks#rooms-callback-events
*/

const http = require("http");
const express = require("express");
const path = require("path");
const app = express();

const twilio = require("twilio");
const client = twilio();
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Max. period that a Participant is allowed to be in a Room (currently 14400 seconds or 4 hours)
// TODO: is this strictly necessary?
const MAX_ALLOWED_SESSION_DURATION = 14400;

const patientPath = path.join(__dirname, "./public/patient.html");
console.log("patientPath", patientPath);
app.use("/patient", express.static(patientPath));

app.use(express.static(__dirname + "/public"));

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
  const grant = new VideoGrant();
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

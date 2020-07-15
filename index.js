/* TODO:
 - implement Express boilerplate for routing
 - add a route to generate access token
 - add a route for the patient view
 - add express boilerplate to serve front end
 - add html page that points to route for patient view
 - add html form to join a video conference
 - implement clicking a button and changing the page state so that it says you're in a waiting room
 - add some css? So that it doesn't look jank?

 - add a route for the provider view
 - add html page for the provider view
 - add html form to join the video conference
 - fire off some sort of event when the provider joins, so that we can also join the patient
*/

const http = require("http");
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Hello World!"));

http.createServer(app).listen(1337, () => {
  console.log("express server listening on port 1337");
});

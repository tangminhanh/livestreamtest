const express = require("express")
const app = express()
const path = require("path")
const fs = require('fs');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.set("views", path.join(__dirname, '/views'))
app.get("/", function(req,res) {
    res.render('home.ejs')
}) 

app.get("/video2", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "bigbuck.mp4";
  const videoSize = fs.statSync("bigbuck.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});
app.use(express.urlencoded())
app.post("/", function (req, res) {
  /* This server is only available to nginx */
  const streamkey = req.body.key;
  /* You can make a database of users instead :) */
  if (streamkey === "supersecret") {
    res.status(200).send();
    return;
  }
  /* Reject the stream */
  res.status(403).send();
});
app.use("/assets/js", (req, res, next) => {
  res.type("application/javascript");
  next();
});
app.use("/assets/css", (req, res, next) => {
  res.type("text/css");
  next();
});
app.listen(3000,() => {
    console.log("listen on http://localhost:3000/")
})
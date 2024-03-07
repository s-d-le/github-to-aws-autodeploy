import express from "express";
import { S3 } from "aws-sdk";

const accessKeyId = "";
const secretAccessKey = "";
const region = "";
const bucket = "";

const s3 = new S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  endpoint: `s3.${region}.amazonaws.com`,
  signatureVersion: "v4",
});

const app = express();

// all requests will be handled by this function
app.get("/*", async (req, res) => {
  // id.github-to-aws.com extract id
  const host = req.hostname;
  const id = host.split(".")[0];
  console.log(`Project id: ${id}`);
  // /index.html extract file path
  const filePath = req.path;

  const contents = await s3
    .getObject({
      Bucket: bucket,
      Key: `dist/${id}${filePath}`, //dist/1234/index.html
    })
    .promise();

  // setting content type header or else browser will download the file
  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";
  res.set("Content-Type", type);

  res.send(contents.Body);
});

app.listen(3001);

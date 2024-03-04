import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";

// Setup redis queue
const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/username/repo
  const id = generateRandomId();
  //use absolute path to get output inside dist so git will ignore it
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  // generates absolute path to the files in the output folder
  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  files.forEach(async (file) => {
    // args:    fileName: remove local path and "/" infront of output folder,
    //          localFilePath: complete path to the file
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  console.log(`Deploying ${repoUrl} as ${id}`);

  // send this to S3
  publisher.lPush("build-queue", id);

  res.json({
    id: id,
  });

  // aws-sdk
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json
uploadFile(
  "dist/utils.js",
  "/Users/sonledang/Projects/github-to-aws-autodeploy/upload-service/dist/utils.js"
);

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/username/repo
  const id = generateRandomId();
  //use absolute path to get output inside dist so git will ignore it
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  console.log(files);

  console.log(`Deploying ${repoUrl} as ${id}`);

  // send this to S3
  res.json({
    id: id,
  });

  // aws-sdk
  // generates absolute path to the files in the output folder
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

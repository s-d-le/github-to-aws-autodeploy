import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generateRandomId } from "./utils";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl; //github.com/username/repo
  const id = generateRandomId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`)); //use absolute path to get output inside dist

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

import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

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

//get files from prefix folder (output/id)
export async function downloadS3folder(prefix: string) {
  const allFiles = await s3 //array contains all files
    .listObjectsV2({
      Bucket: bucket,
      Prefix: prefix,
    })
    .promise();

  // promisify
  const allPromises =
    // iterate through [ output/id/index.html, output/id/index.css ...]
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key); //dist/output/...

        // check if write directory has existed, if not create one
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        // form the output file upload into S3
        const outputFile = fs.createWriteStream(finalOutputPath); //download big file in chunks as stream
        s3.getObject({
          Bucket: "github-to-aws",
          Key: Key || "",
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];

  console.log("awaiting");

  // wait for all allPromises => [Promise, Promise] to be ready then return function
  await Promise.all(allPromises?.filter((x) => x !== undefined));
}

export function copyFinalBuildToS3(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`); //get path to final build folder
  const allFiles = getAllFiles(folderPath); //get all files from folder as array
  allFiles.forEach((file) => {
    //upload file to S3 recursively
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
  console.log("final build uploaded");
}

// get all files from folder as array
const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

// copy final build file to S3
const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: bucket,
      Key: fileName,
    })
    .promise();
  console.log(response);
};

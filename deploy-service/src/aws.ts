import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

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
      Bucket: "github-to-aws",
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

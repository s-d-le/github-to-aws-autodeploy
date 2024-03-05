import { S3 } from "aws-sdk";
import fs from "fs";

const s3 = new S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  endpoint: `s3.${region}.amazonaws.com`,
  signatureVersion: "v4",
});

// fileName => output/12312/src/App.jsx
// filePath => /Users/name/project/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath); // read entire file
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: bucket,
      Key: fileName, // clean path without username
    })
    .promise();
  console.log(response);
};

import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string): string[] => {
  // /home/user/project/output/123
  let response: string[] = [];

  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      // recursively get all files in sub folders
      // concat will merge the arrays instead of push which will add an array to the response array
      response = response.concat(getAllFiles(filePath));
    } else {
      response.push(filePath);
    }
  });
  return response;
};

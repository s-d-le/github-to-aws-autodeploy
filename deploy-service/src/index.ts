import { createClient, commandOptions } from "redis";
import { downloadS3folder, copyFinalBuildToS3 } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();
subscriber.connect(); //localhost. Should be different on production

async function main() {
  //infinite loop
  while (true) {
    const response = await subscriber.brPop(
      //pop from right side
      commandOptions({ isolated: true }),
      "build-queue", //this name is set in the upload service
      0 //never timeout
    );
    console.log(response);
    // @ts-ignore
    const id = response.element;

    await downloadS3folder(`output/${id}`);
    console.log("downloaded");
    await buildProject(id);
    console.log("build complete");
    await copyFinalBuildToS3(id);
  }
}
main();

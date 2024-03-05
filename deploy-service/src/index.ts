import { createClient, commandOptions } from "redis";
import { downloadS3folder } from "./aws";
const subscriber = createClient();
subscriber.connect(); //localhost. Should be different on production

async function main() {
  //infinite loop
  while (1) {
    const response = await subscriber.brPop(
      //pop from right side
      commandOptions({ isolated: true }),
      "build-queue", //this name is set in the upload service
      0 //never timeout
    );
    console.log(response);
    // @ts-ignore
    const id = response?.element;

    await downloadS3folder(`output/${id}`);
    console.log("downloaded");
  }
}
main();

This project is inspired by Vercel deployment process. It downloads projects from github then uploads to S3 server then deploys to E2C server. It includes 3 services:

### Upload service

- Downloads project from github and uploads to S3 server
- Creates an `id` for `Simple Queue Service` to tell the deploy service when the code is ready for deployment

### Deployment service

- Taking `id` from the `SQS` then start the build process. It can possibly assign multiple workers to build multiple projects at the same time (scaling horizontally with AWS Fargate)
- The source from S3 (React) is converted to HTML/CSS/JS then reuploaded to S3

### Request handler service

- When user access project-name.gtaad.app, it will request the built version of the code from S3 and return to the user
- It also caches the built version of the code for faster access
- To test this locally, we can mock the something like `1234.vercel.com` to `localhost:3001` by adding a new entry to `/etc/hosts`

### The Queue

- For each running process we left-push an `id` to the queue with `lpush` and the next process can query by `rpop` and run (first in first out)

## How to run

Start redis server

```
redis-server
```

Build and run services

```
npx tsc -b
node dist/index.js
```

Redis CLI for queue information

```
redis-cli
RPOP
```

Test deploy queue

```
cd deploy-service
npm run dist/index.js
redis-cli
LPUSH build-queue 123 //should log 123
```

## Deploy a project

```
run redis-server

run upload-service
use postman to send a POST request to localhost:3000/deploy with body { "repoUrl": "your-github-repo" }
send a GET request to localhost:3000/status?id=id to check the status of the deployment

run deploy-service
it should get the id from redis queue start the deployment process

you can set the localhost to something like id.yourdomain.com by adding a new entry to /etc/hosts if you are working on local environment

run request-handler
go to id.yourdomain.com/index.html to see the deployed project
```

## FAQs

- Why upload and deployment service are separated?
  - Because deployment service is CPU intensive while upload is very simple. It's better to separate them to different services to scale them independently
- Why do we need a queue between upload and deployment service?
  - The deployment service might be busy with other projects. We need asynchronously tell the deployment service when the code is ready for deployment. When the deployment service is free, it will take the `id` from the queue and start the deployment process

## Future Developments

- Moving from wm EC2 to serverless with Lambda

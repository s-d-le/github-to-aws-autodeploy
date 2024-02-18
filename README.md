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

## FAQs

- Why upload and deployment service are separated?
  - Because deployment service is CPU intensive while upload is very simple. It's better to separate them to different services to scale them independently
- Why do we need a queue between upload and deployment service?
  - The deployment service might be busy with other projects. We need asynchronously tell the deployment service when the code is ready for deployment. When the deployment service is free, it will take the `id` from the queue and start the deployment process

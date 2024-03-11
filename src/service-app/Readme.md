# service-app
Docker image that provides a ReST API front end to the [legacy-app](./../legacy-app/Readme.md)
script that we created previously.

Since we want to execute the `legacy-app` in the *AppRunner* managed service
from AWS, we need to have a Docker image that can be started and will
expose a port where API calls can be made using HTTP protocols.

We will do this by creating a thin Node.js server for the API endpoint
that will start the script using argument values taken from the POST call
made to the API.  The script is assumed to be long running, so a 202 status
value (Accepted) will be returned, with a token to allow synchronization
after the job completes.

We will create the server endpoint using a Node.js base image, then
copy the execution portion of the server to an image based on the legacy
script image, with Node.js installed to it.  This multi-stage docker build
ensures that we are able to build and end up with a combined image that is
as lightweight as possible.  In our case, the script is the majority of
the image size.

Since the server can execute and start the script many times, mechanisms
are included to allow it do so without conflicting between execution
instances of the script.

The `Dockerfile` here is based on the ideas and techniques contained in 
James Harrison's [blog post](https://www.fl0.com/blog/the-perfect-multi-stage-dockerfile-for-node-js-apps)
about building a working Node.js server.  Here we extend that to include
incorporation of an existing (legacy) image with script(s) to execute by
the server.

## Build the service docker image
This service provides and endpoint, and for this example accepts POST requests with data that will be
used to inform the script that will be executed.

There is a multi-stage build `Dockerfile` that builds a clean Node.js server image and then copies it
into the production stage.  The production stage uses the `legacy-app` image as a base, and the build
stage here has the executable server files copied into the production stage.  Before the server files
are copied in, the Node.js server is installed to the production stage as well.

The build stage requires the `package-lock.json` file to be present in order to determine what modules
to load for a clean build.  This example does not include a development environment for the service
internal to the `Dockerfile`, so the developer will need to perform an initial install in order to generate
the correct lockfile.

```bash
service-app: 
service-app: ls
Dockerfile  Readme.md  package.json  src
service-app: docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
legacy-app   latest    48381cd69e1e   5 hours ago   1.29GB
service-app: npm install

added 386 packages, and audited 387 packages in 5s

47 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
service-app: ls
Dockerfile  Readme.md  node_modules  package-lock.json  package.json  src
service-app: du -sh node_modules
53M     node_modules
service-app: docker build -t service-app .
[+] Building 0.9s (16/16) FINISHED                                                                                                                                  docker:default
 => [internal] load .dockerignore                                                                                                                                             0.2s
 => => transferring context: 2B                                                                                                                                               0.0s
 => [internal] load build definition from Dockerfile                                                                                                                          0.1s
 => => transferring dockerfile: 906B                                                                                                                                          0.0s
 => [internal] load metadata for docker.io/library/legacy-app:latest                                                                                                          0.0s
 => [internal] load metadata for docker.io/library/node:18                                                                                                                    0.2s
 => [builder 1/6] FROM docker.io/library/node:18@sha256:aa329c613f0067755c0787d2a3a9802c7d95eecdb927d62b910ec1d28689882f                                                      0.0s
 => [internal] load build context                                                                                                                                             0.1s
 => => transferring context: 201.86kB                                                                                                                                         0.0s
 => [production 1/4] FROM docker.io/library/legacy-app:latest                                                                                                                 0.0s
 => CACHED [production 2/4] RUN apt-get update &&     apt-get install -y nodejs                                                                                               0.0s
 => CACHED [production 3/4] WORKDIR /usr/src/app                                                                                                                              0.0s
 => CACHED [builder 2/6] WORKDIR /usr/src/app                                                                                                                                 0.0s
 => CACHED [builder 3/6] COPY package*.json ./                                                                                                                                0.0s
 => CACHED [builder 4/6] RUN rm -rf node_modules                                                                                                                              0.0s
 => CACHED [builder 5/6] RUN npm ci --only=production                                                                                                                         0.0s
 => CACHED [builder 6/6] COPY ./src ./src                                                                                                                                     0.0s
 => CACHED [production 4/4] COPY --from=builder /usr/src/app ./                                                                                                               0.0s
 => exporting to image                                                                                                                                                        0.0s
 => => exporting layers                                                                                                                                                       0.0s
 => => writing image sha256:1e22dfd8002d461a41d3bb58ed8687e2b6933e952820adbaf38ce67f4253cc9c                                                                                  0.0s
 => => naming to docker.io/library/service-app                                                                                                                                0.0s
service-app: docker images
REPOSITORY    TAG       IMAGE ID       CREATED       SIZE
service-app   latest    1e22dfd8002d   2 hours ago   1.37GB
legacy-app    latest    48381cd69e1e   5 hours ago   1.29GB
service-app: docker run -it --rm -p80:3000 --entrypoint sh service-app
# du -sh node_modules
4.9M    node_modules
# exit
service-app: 
```

## Start the service
We start the service locally to check its operation.  As built, we need to forward the internal
port 3000 that the service is listening on to the external port 80.  You will need to make sure
that when you specify the image for execution using *AppRunner* that you include the correct
ports.

```bash
service-app: docker run -it --rm -p80:3000 service-app
Listening on port 3000

```

The service will continue to listen for API calls until you stop it using CTL-C (SIGTERM).

At this point, you can use Curl to send API requests to the service.  This shows the
client call: POST data (`"{\"bob\":\"alice\"}"`),
ContentType (`application/json`), URL (`http://localhost`), and resource (`/start`)

The value returned to the client is also shown here: the object contains values for hte
unique call identifier (`id`), millisecond timestamp (`when`), status (`completed`),
and a copy of the API call data (`pdata`).

There is a single call first, then a pair of calls made within 2 seconds of each other
that have different POST data.  This shows that multiple script invocations were made
and were executed concurrently.

Sending:
```bash
client: 
client: curl -X POST -H "Content-Type: application/json" -d "{\"bob\":\"alice\"}" http://localhost/start
{"id":"ff81f648-89aa-4dbc-9dcc-bd8ad5d006b8","when":1710118000149,"completed":true,"pdata":{"bob":"alice"}}
client: 
client: 
client: curl -X POST -H "Content-Type: application/json" -d "{\"bob\":\"carol\"}" http://localhost/start
{"id":"d253e768-c2e5-494c-b315-735e4593b816","when":1710118024484,"completed":true,"pdata":{"bob":"carol"}}
client: curl -X POST -H "Content-Type: application/json" -d "{\"bob\":\"alice\"}" http://localhost/start
{"id":"b769227a-c658-4471-bc02-a299c6cb55d1","when":1710118026359,"completed":true,"pdata":{"bob":"alice"}}
client: 
```

On the service side, you can see that the three calls resulted in the script being
started once for each unique `id` and each at the timestamps from the call return data.

From the service output:
```bash
service-app: 
service-app: docker run -it --rm -p80:3000 service-app
Listening on port 3000
Arg: 0, Value: ff81f648-89aa-4dbc-9dcc-bd8ad5d006b8,1710118000149,alice
Done

Arg: 0, Value: d253e768-c2e5-494c-b315-735e4593b816,1710118024484,carol
Done

Arg: 0, Value: b769227a-c658-4471-bc02-a299c6cb55d1,1710118026359,alice
Done

^Cservice-app: 
service-app: 
```

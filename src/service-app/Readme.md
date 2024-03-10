# service-app
Docker image that provides a ReST API front end to the [legacy-app](../../blob/main/src/legacy-app/Readme.md)
script that we created previously.

Since we want to execute the legacy-app in the AppRunner managed service
from AWS, we need to have a Docker image that can be started and will
expose a port where API calls can be made using HTTP protocols.

We will do this by creating a thin Node.js server for the API endpoint
that will start the script using argument values taken from the POST call
made to the API.  The script is assumed to be long running, so a 201 will
be returned, with a token to allow synchronization after the job
completes.

We will create the server endpoint using a node.js base image, then
copy the execution portion of the server to an image based on the legacy
script image, with node.js installed to it.  This multi-stage docker build
ensures that we are able to build and end up with a combined image that is
as lightweight as possible.  In our case, the script is the majority of
the image size.

Since the server can execute and start the script many times, mechanisms
are included to allow it do so without conflicting between execution
instances of the script.

The Dockerfile here is based on the ideas and techniques contained in 
James Harrison's [blog post](https://www.fl0.com/blog/the-perfect-multi-stage-dockerfile-for-node-js-apps)

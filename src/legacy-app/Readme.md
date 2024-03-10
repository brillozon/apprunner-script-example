# legacy-app
Docker image that executes a script, emulating a legacy application.
The script emulates an application workload by waiting for 5 seconds
before completing operation and returning.

Here we setup to use an older base image which contains an older Python
version.  This reflects the use case that I am familiar with, and which
I don't find when searching for examples.  :)

## Run the script standalone

We can run the script on the command line to learn how it works and see
what to expect when executing.  This script is basic and does not use
external dependencies beyond the base packages, so should run fine for
any version of Python.  Well 3 or later.

Here we see that our develoopment environment includes Python 3.10, and
the script runs with no, 2, and 3 argument.  Terminal interrrupts are
handled and the script terminated early.

```bash
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ python --version
Python 3.10.13
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ python run-script.py 
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ python run-script.py one two
Arg: 0, Value: one
Arg: 1, Value: two
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ python run-script.py one two three
Arg: 0, Value: one
Arg: 1, Value: two
Arg: 2, Value: three
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ python run-script.py one two three
Arg: 0, Value: one
Arg: 1, Value: two
Arg: 2, Value: three
^CDone
Traceback (most recent call last):
  File "/workspaces/apprunner-script-example/src/legacy-app/run-script.py", line 18, in <module>
    do_work(sys.argv[1:])
  File "/workspaces/apprunner-script-example/src/legacy-app/run-script.py", line 13, in do_work
    time.sleep(5)
KeyboardInterrupt

@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ 
```

##  Build the docker image
Note that for this example we are leaving any registry/repository
complexities to the developer.

```bash
@@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker build -t legacy-app .
[+] Building 0.8s (10/10) FINISHED                                                                                                                                  docker:default
 => [internal] load build definition from Dockerfile                                                                                                                          0.1s
 => => transferring dockerfile: 1.11kB                                                                                                                                        0.0s
 => [internal] load .dockerignore                                                                                                                                             0.1s
 => => transferring context: 2B                                                                                                                                               0.0s
 => [internal] load metadata for docker.io/library/ubuntu:focal-20240216                                                                                                      0.3s
 => [auth] library/ubuntu:pull token for registry-1.docker.io                                                                                                                 0.0s
 => [1/4] FROM docker.io/library/ubuntu:focal-20240216@sha256:80ef4a44043dec4490506e6cc4289eeda2d106a70148b74b5ae91ee670e9c35d                                                0.0s
 => [internal] load build context                                                                                                                                             0.1s
 => => transferring context: 35B                                                                                                                                              0.0s
 => CACHED [2/4] RUN export LANGUAGE="en_US.UTF-8" &&     ln -s /usr/share/zoneinfo/UTC /etc/localtime &&     apt-get clean &&     rm -rf /var/lib/apt/lists/* &&     apt-ge  0.0s
 => CACHED [3/4] RUN apt-get -qq update -y  && apt-get -qq upgrade -y  && apt-get -qq --fix-missing install -y             curl             ess             python3           0.0s
 => CACHED [4/4] COPY run-script.py /root/                                                                                                                                    0.0s
 => exporting to image                                                                                                                                                        0.1s
 => => exporting layers                                                                                                                                                       0.0s
 => => writing image sha256:48381cd69e1eac7b85b6018f34cbdc23382ff817dc46f5993176d446696c58a3                                                                                  0.0s
 => => naming to docker.io/library/legacy-app                                                                                                                                 0.0s
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ 
```

Here we are simply building an image to execute the script.  I'll leave
optimizing the image size to the developer.  Hint: multi-stage builds
are your friend.

The image we create here is 1.2Gb in size, so developers would want to
optimize this.

We can see that the image includes an older version of Python (3.8) which
is what we expect in our (simulated) legacy application.

```bash
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker images
REPOSITORY   TAG       IMAGE ID       CREATED          SIZE
legacy-app   latest    48381cd69e1e   12 minutes ago   1.29GB
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker run --rm -i -t --entrypoint sh legacy-app
# python3 --version
Python 3.8.10
# exit
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ 
```

## Execute the script as a container
We can run the script as a docker container as well.

The script runs with no, 2, and 3 arguments.  With no arguments, the container
will provide a default argument when calling the script.  Terminal interrrupts
are passed by the container to the script which terminates early.

We can see that the same behaviors of the script are available when executing
as a docker container.

```bash
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker run --rm -i -t legacy-app
Arg: 0, Value: defaultarg
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker run --rm -i -t legacy-app one two
Arg: 0, Value: one
Arg: 1, Value: two
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker run --rm -i -t legacy-app one two three
Arg: 0, Value: one
Arg: 1, Value: two
Arg: 2, Value: three
Done
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ docker run --rm -i -t legacy-app one two three
Arg: 0, Value: one
Arg: 1, Value: two
Arg: 2, Value: three
^CDone
Traceback (most recent call last):
  File "/root/run-script.py", line 18, in <module>
    do_work(sys.argv[1:])
  File "/root/run-script.py", line 13, in do_work
    time.sleep(5)
KeyboardInterrupt
@brillozon ➜ /workspaces/apprunner-script-example/src/legacy-app (main) $ 
```

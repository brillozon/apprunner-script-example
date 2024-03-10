# apprunner-script-example
Example of preparing a script from a legacy container to execute with AppRunner.

This demonstrates setting up a single Docker image that extends an
original legacy Docker image that is executed as a script.  The
extension includes an API endpoint (using nodejs) that allows the
script to be executed via a ReST call.  This means that the image
can be provisioned and execute using the AppRunner managed service in AWS.

The legacy image is expected to be a long running script that does
not return immediately to the caller.  Synchronization with this
long running script is left to the implementors.

Included here is a stub legacy script that builds into a Docker
image and the service image that extends the original legacy
image.  This allows a single image to be provisioned within
AppRunner without any need for network management or interprocess
communication outside of the running container.

In the case where you want to execute multiple instances of the
script, you should recall that any local disk used by the script
will need to be shared among instances.  This implies that paths
to the local disk should include a way to discriminate the
ownership of files.  This can be as simple as including an
instance identifier in paths.

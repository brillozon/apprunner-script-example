# Use an older, almost EOL version here to simulate an actual legacy script
FROM ubuntu:focal-20240216

# Some basic installation and cleanup here.
# Simulate a Python script environment.
ENV DEBIAN_FRONTEND=noninteractive

RUN export LANGUAGE="en_US.UTF-8" && \
    ln -s /usr/share/zoneinfo/UTC /etc/localtime && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y software-properties-common

RUN apt-get -qq update -y \
 && apt-get -qq upgrade -y \
 && apt-get -qq --fix-missing install -y \
            curl \
            ess \
            python3 \
            python3-pip \
            python3-gdal \
            python3-boto3 \
            python3-pandas \
 && pip3 install --upgrade pip \
 && apt-get autoclean && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Simply use the root home
COPY run-script.py /root/

# Run the script using the old versions Python we installed
# and pass along any additional arguments
ENTRYPOINT [ "python3", "/root/run-script.py" ]

CMD ["defaultarg"]

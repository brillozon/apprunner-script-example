# Use a Node.js base image so we don't have to install a bunch of extra things
# 16 from blog, 10.19 is the version installed to the script container
# 18 is the oldest version still with support :\ 

# "Builder" stage does an NPM clean install with only production dependencies 
FROM node:18 as builder

WORKDIR /usr/src/app

COPY package*.json ./

# Clean install.  This is about 10% of the full install size.
RUN rm -rf node_modules
RUN npm ci --only=production

# Copy the rest of our source code over to the image
COPY ./src ./src

EXPOSE 80

CMD [ "npm", "start" ]
 
# Final stage uses the script image and copies the built assets across from the "builder" stage
FROM legacy-app:latest as production

RUN apt-get update && \
    apt-get install -y nodejs

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

ENTRYPOINT [ "node" ]

CMD [ "src/index.js" ]

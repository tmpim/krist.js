FROM node:20-alpine
WORKDIR /build
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
ENV NODE_ENV=production
COPY . .
RUN mkdir docs out
RUN yarn run docs
CMD cp -r docs/* out/

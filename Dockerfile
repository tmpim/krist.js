FROM node:16.17-alpine3.15
WORKDIR /build
COPY ["package.json", "yarn.lock", "./"]
RUN yarn global add typedoc@^0.23.7
RUN yarn install
ENV NODE_ENV=production
COPY . .
RUN mkdir docs out
RUN yarn run docs
CMD cp -r docs/* out/

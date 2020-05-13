###
# swagger-ui-builder - https://github.com/wordnik/swagger-ui/
# Container for building the swagger-ui static site
#
# Build: docker build -t swagger-ui-builder .
# Run:   docker run -v $PWD/dist:/build/dist swagger-ui-builder
#
###

FROM    node:8

WORKDIR /build
ADD     package.json    /build/package.json
RUN     npm install
ADD     .   /build
RUN     ./node_modules/gulp/bin/gulp.js default

CMD     ./node_modules/gulp/bin/gulp.js serve
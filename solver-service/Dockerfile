FROM alpine:latest AS BuildEnv

COPY SolverService /opt/SolverService

RUN apk update && apk add \
    ca-certificates \
    build-base \
    cmake \
    git \
    python3 \
    wget \
    linux-headers

RUN cd /opt && \
    git clone https://github.com/open-source-parsers/jsoncpp.git && \
    cd jsoncpp && \
    cmake -S . -B build &&\
    cmake --build build --config=Release && \
    cmake --install build

RUN cd /opt && \
    git clone https://github.com/apache/qpid-proton.git && \
    cd qpid-proton && \
    cmake -S . -B build \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_TESTING=OFF \
    -DENABLE_JSONCPP=ON && \
    cmake --build build --config=Release && \
    cmake --install build

RUN cd /opt && \
    wget --quiet \
    https://boostorg.jfrog.io/artifactory/main/release/1.82.0/source/boost_1_82_0.tar.gz && \
    tar xzf ./boost_1_82_0.tar.gz && \
    cd ./boost_1_82_0 && \
    ./bootstrap.sh && \
    ./b2 variant=release link=static threading=multi --with-filesystem install

RUN cd /opt/SolverService && \
    cmake -S . -B build && \
    cmake --build build --config=Release

#build the main executable and copy runtime dependencies to the location expected by the binary
RUN mkdir -p /opt/runtime_deps && \
    cd /opt/SolverService/build && \
    ldd SolverService \
    | awk '/=>/ {print $3} !/=>/ {print $1}' \
    | tee /opt/runtime_deps/RUNTIME_DEPS | xargs -I {} cp "{}" /opt/runtime_deps/

FROM minizinc/minizinc:latest-alpine AS RuntimeEnv
COPY --from=BuildEnv /opt/SolverService/build/SolverService /bin/
COPY --from=BuildEnv /opt/runtime_deps /opt/runtime_deps
RUN cd /opt/runtime_deps && \
    xargs -a RUNTIME_DEPS -I {} sh -c 'mkdir -p "$(dirname "{}")" && cp "$(basename "{}")" "{}"' && \
    rm -rf /opt/runtime_deps

ENTRYPOINT [ "SolverService" ]
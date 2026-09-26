# Base Developer Container for Chi-Physics & Cloud Sandboxes
FROM node:22-alpine AS runtime

# Install system essentials: zsh (required by CSB), bash, git, curl, python3, build tools
RUN apk add --no-cache \
    zsh \
    bash \
    git \
    curl \
    python3 \
    py3-pip \
    make \
    g++

# Enable modern package managers
RUN corepack enable

# Ensure default shell is zsh
ENV SHELL=/bin/zsh

# Workspace directory mounted by CodeSandbox / DevContainers
WORKDIR /project/workspace

FROM node:slim

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Install basic development tools and iptables/ipset
RUN apt-get update && apt-get install -y --no-install-recommends \
  less \
  git \
  sudo \
  unzip \
  jq \
  vim

# Make devcon user
RUN useradd -m -s /bin/bash devcon

# Ensure devcon user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R devcon:devcon /usr/local/share

ARG USERNAME=devcon

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/devcon/.claude && \
  chown -R devcon:devcon /workspace /home/devcon/.claude

WORKDIR /workspace

# Set up non-root user
USER devcon

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/bash

# Set the default editor and visual
ENV EDITOR=vim
ENV VISUAL=vim

# Install Claude
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}



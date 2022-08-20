FROM node:14.18.0

RUN apt-get update && apt-get -y install git && rm -rf /var/lib/apt/lists/*

RUN mkdir /workspace && \
  cd /workspace && \ 
  git clone https://github.com/osama-bitk/DrillBit_Analyzer.git && \
  cd DrillBit_Analyzer && \
  npm install

WORKDIR /workspace/DrillBit_Analyzer

ENTRYPOINT ["npm", "start"]

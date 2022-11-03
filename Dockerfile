FROM kasumi993/env-tsunami
RUN apt-get update && apt install
COPY . /home/tsunami
WORKDIR /home/tsunami
CMD node api.js
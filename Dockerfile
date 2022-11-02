FROM kasumi993/env-tsunami-new 
RUN apt-get update && apt install
WORKDIR /home/tsunami
CMD node api.js
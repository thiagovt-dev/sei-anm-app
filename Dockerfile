# Usando a imagem do Playwright na versão 1.36.0, que já inclui Node.js e Python
FROM mcr.microsoft.com/playwright:v1.36.0-focal

# Definindo o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Instalando Tesseract, unzip, Python3-pip e suas dependências
RUN apt-get update \
  && apt-get install -y libtesseract-dev tesseract-ocr unzip python3-pip \
  && apt-get clean

# Adicionando o Bun ao Path
ENV PATH="/root/.bun/bin:${PATH}"

# Instalando o Bun
RUN curl -fsSL https://bun.sh/install | bash

# Copiando o restante do código do aplicativo
COPY . .

# Instalando as dependências do Python
RUN pip3 install --no-cache-dir opencv-python-headless==4.10.0.84
RUN pip3 install --no-cache-dir -r /usr/src/app/src/services/scraping/python/requirements.txt

# Instalando as dependências Node.js
RUN bun install

# Build
RUN bun run build

# Defina a variável de ambiente NODE_ENV com valor padrão
ENV NODE_ENV=production

# Iniciar a aplicação
CMD if [ "$NODE_ENV" = "development" ]; then bun run dev; else bun run dist/app.js; fi

# Expondo a porta em que o aplicativo vai rodar
EXPOSE 3000

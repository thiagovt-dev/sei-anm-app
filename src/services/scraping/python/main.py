import sys
import os
import re
import asyncio
from playwright.async_api import async_playwright
from captcha_solver import resolve_captcha
from document_downloader import download_documents

async def main(process_number):
    async with async_playwright() as p:
        
        browser = await p.chromium.launch(headless=True, args=["--ignore-certificate-errors"])
        context = await browser.new_context(ignore_https_errors=True)

        page = await context.new_page()

        url = "https://sei.anm.gov.br/sei/modulos/pesquisa/md_pesq_processo_pesquisar.php?acao_externa=protocolo_pesquisar&acao_origem_externa=protocolo_pesquisar&id_orgao_acesso_externo=0"
        await page.goto(url)

        # Execução do processo
        if await resolve_captcha(page, process_number):
            print("CAPTCHA resolved and submitted successfully.")
            await page.wait_for_timeout(2000)

            # Capturando a nova página
            new_page_promise = context.wait_for_event("page")
            await page.click('.protocoloNormal')
            new_page = await new_page_promise

            # Aguardando a nova página carregar completamente
            await new_page.wait_for_load_state('load')

            # Capturar a URL atual da nova página
            current_url = new_page.url

            # Extrair o hash da URL da nova página
            hash_match = re.search(r'\?([^#]+)', current_url)
            hash_value = hash_match.group(1) if hash_match else None

            # Passar a nova página para o processo de download de documentos
            await download_documents(new_page, process_number, hash_value)  

            # Imprimir o hash para capturar no Node.js
            if hash_value:
                print(f"Hash extraído: {hash_value}")

        # Limpar arquivos temporários
        if os.path.exists('captcha.png'):
            os.remove('captcha.png')

        for threshold_value in [100, 105, 110, 115, 125, 130, 135, 140, 145, 150, 200]:
            processed_image_path = f'processed_captcha_{threshold_value}.png'
            if os.path.exists(processed_image_path):
                os.remove(processed_image_path)

        await browser.close()

if __name__ == "__main__":
    process_number = sys.argv[1]  # Pega o número do processo da linha de comando
    asyncio.run(main(process_number))

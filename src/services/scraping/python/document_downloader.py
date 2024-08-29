import os
import json
import re
from playwright.async_api import Page

async def download_documents(page: Page, process_number: str, hash_value: str):
    documents = []

    # Filtrar o número do processo para conter apenas dígitos
    process_number = re.sub(r'\D', '', process_number)
    base_path = f'src/documentsProcess/{process_number}'
    os.makedirs(base_path, exist_ok=True)

    try:
        table = await page.query_selector('#tblDocumentos')
        if not table:
            print("Tabela de documentos não encontrada.")
            await page.screenshot(path='table_not_found.png')
            return

        print("Tabela de documentos localizada.")
        rows = await table.query_selector_all('.infraTrClara')

        if not rows:
            print("Nenhuma linha encontrada na tabela de documentos.")
            return

        for index, row in enumerate(rows):
            try:
                doc_num_element = await row.query_selector('td:nth-child(2) > a')
                doc_name = await doc_num_element.text_content()
                doc_name = re.sub(r'[^\w\s]', '', doc_name).strip()  # Remove caracteres especiais do nome
                tipo_documento = await row.query_selector('td:nth-child(3)')
                data_documento = await row.query_selector('td:nth-child(4)')
                data_registro = await row.query_selector('td:nth-child(5)')
                link = await doc_num_element.get_attribute('onclick')

                # Extrair a URL do documento
                file_url = re.search(r"'(md_pesq_documento_consulta_externa\.php.*?)'", link).group(1)
                full_file_url = f"https://sei.anm.gov.br/sei/modulos/pesquisa/{file_url}"
                
                response = await page.request.get(full_file_url, ignore_https_errors=True)
                content_type = response.headers.get('content-type', '')

                # Determinar a extensão do arquivo com base no tipo de conteúdo
                if 'pdf' in content_type:
                    file_extension = 'pdf'
                elif 'xml' in content_type:
                    file_extension = 'xml'
                else:
                    file_extension = 'html'

                file_path = os.path.join(base_path, f"{doc_name}.{file_extension}")

                # Salvar o arquivo
                with open(file_path, 'wb') as file:
                    file.write(await response.body())

                documents.append({
                    "numero_documento": doc_name,
                    "tipo_documento": await tipo_documento.text_content(),
                    "data_documento": await data_documento.text_content(),
                    "data_registro": await data_registro.text_content(),
                    "caminho_arquivo": file_path,
                    "url_hash": hash_value  
                })

            except Exception as e:
                print(f"Erro ao processar documento {index + 1}: {e}")
        
        if documents:
            json_path = os.path.join(base_path, 'document.json')
            with open(json_path, 'w', encoding='utf-8') as json_file:
                json.dump(documents, json_file, indent=4, ensure_ascii=False)
            print(f"Todos os documentos foram baixados e os dados foram salvos no arquivo {json_path}")
        else:
            print("Nenhum documento foi baixado.")
    
    except Exception as e:
        print(f"Erro ao localizar a tabela de documentos: {e}")
        await page.screenshot(path='table_not_found.png')


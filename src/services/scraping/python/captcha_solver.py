import os
import re
import cv2
import pytesseract
import time
from playwright.async_api import Page

thresholds_to_try = [100, 105, 110, 115, 125, 130, 135, 140, 145, 150, 200]

async def preprocess_image(image_path, thresholds):
    processed_images = []
    
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    for threshold_value in thresholds:
        image_copy = cv2.medianBlur(image, 3)
        _, thresholded_image = cv2.threshold(image_copy, threshold_value, 255, cv2.THRESH_BINARY)
        processed_image_path = f'processed_captcha_{threshold_value}.png'
        cv2.imwrite(processed_image_path, thresholded_image)
        processed_images.append((processed_image_path, threshold_value))
    
    return processed_images

async def select_best_image(processed_images):
    best_image = None
    best_text = ""

    for image_path, threshold_value in processed_images:
        captcha_text = pytesseract.image_to_string(image_path, config='--psm 10').strip()
        captcha_text = re.sub(r'[^a-zA-Z0-9]', '', captcha_text)
        
        # Verificar se o texto é válido e tem 4 caracteres
        if len(captcha_text) == 4:
            best_text = captcha_text
            best_image = (image_path, captcha_text, threshold_value)
            break
    
    return best_image

async def resolve_captcha(page: Page, process_number: str):
    trying = 0
    while True:
        trying += 1
        await page.fill('#txtProtocoloPesquisa', process_number)

        captcha_img = await page.query_selector('img[alt="Não foi possível carregar imagem de confirmação"]')

        if captcha_img is None:
            await page.reload()
            await page.wait_for_timeout(1500)  # Espera antes de tentar novamente
            continue

        try:
            await captcha_img.screenshot(path='captcha.png')

            if not os.path.exists('captcha.png'):
                await page.reload()
                await page.wait_for_timeout(1500)
                continue
        except Exception as e:
            await page.reload()
            await page.wait_for_timeout(1500)  # Espera antes de tentar novamente
            continue

        processed_images = await preprocess_image('captcha.png', thresholds_to_try)
        
        best_image = await select_best_image(processed_images)

        if best_image is None:
            await page.reload()
            await page.wait_for_timeout(1500)
            continue
        
        _, captcha_text, threshold_value = best_image

        captcha_input = await page.query_selector('#txtCaptcha')
        await page.fill('#txtCaptcha', captcha_text)

        # Verificar se o texto foi inserido corretamente no campo CAPTCHA
        filled_value = await captcha_input.input_value()
        if filled_value != captcha_text:
            await page.reload()
            await page.wait_for_timeout(1500)
            continue

        await captcha_input.click()

        time.sleep(2)

        await page.click('#sbmPesquisar')

        # Adicionar tempo de espera para garantir que a página processou a submissão
        await page.wait_for_timeout(1500)

        # Verificar se o elemento `protocoloNormal` está presente na página
        protocolo_normal_present = await page.query_selector('.protocoloNormal')
        if protocolo_normal_present:
            print(f"Attempt {trying} successful with CAPTCHA: {captcha_text} using threshold {threshold_value}")
            return True

        # Se o elemento não estiver presente, esperar antes de tentar novamente
        await page.wait_for_timeout(1500)
        
        # Limpar arquivos temporários
        if os.path.exists('captcha.png'):
            os.remove('captcha.png')
        for image_path, _ in processed_images:
            if os.path.exists(image_path):
                os.remove(image_path)

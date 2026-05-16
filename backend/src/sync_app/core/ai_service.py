import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class AIService:
    @staticmethod
    def extract_text(file_content: bytes, filename: str) -> str:
        text = ""
        try:
            # Cas 1 : C'est un PDF
            if filename.lower().endswith('.pdf'):
                doc = fitz.open(stream=file_content, filetype="pdf")
                for page in doc:
                    text += page.get_text()
                doc.close()
                
            # Cas 2 : C'est une Image (le scan mobile)
            else:
                image = Image.open(io.BytesIO(file_content))
                text = pytesseract.image_to_string(image, lang='fra')

            return text.strip()
        except Exception as e:
            print(f"Erreur d'extraction : {e}")
            return ""
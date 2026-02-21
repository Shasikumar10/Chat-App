import io
from PyPDF2 import PdfReader

def extract_text(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with io.open("resume_utf8.txt", "w", encoding="utf-8") as f:
            f.write(text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text("RESUME.pdf")

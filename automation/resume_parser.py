import PyPDF2
import os

class ResumeParser:
    def __init__(self, file_path):
        self.file_path = file_path

    def extract_text(self):
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Resume not found at {self.file_path}")
        
        text = ""
        try:
            with open(self.file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text()
            return text
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return None

if __name__ == "__main__":
    # Test parser
    parser = ResumeParser("resume.pdf")
    print(parser.extract_text())

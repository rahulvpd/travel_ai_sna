import pypdf
import os

pdf_path = r"C:\Users\HP\Downloads\Tourism_System_Functionality_With_Implementation.pdf"

try:
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    print("PDF Content Extracted Successfully:")
    print(text)
    
    # Save to a text file for reference
    with open("requirements_extracted.txt", "w", encoding="utf-8") as f:
        f.write(text)

except Exception as e:
    print(f"Error reading PDF: {e}")

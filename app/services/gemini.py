import google.generativeai as genai
import os
from dotenv import load_dotenv
from pathlib import Path

# Force load the .env from the root
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Get the key
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    # Try the alternative name just in case
    api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    raise ValueError(f"Gemini API Key missing! Checked path: {env_path}")

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-3-flash-preview')




def generate_book_outline(title: str, notes: str):
    prompt = f"Write a detailed chapter-by-chapter outline for a book titled '{title}'. Context: {notes}"
    response = model.generate_content(prompt)
    return response.text


def generate_chapter(title, outline, chapter_num, prev_summaries):
    context = "\n".join(prev_summaries)
    prompt = f"""
    Book: {title}
    Outline: {outline}
    Context from previous chapters: {context}
    
    Task: Write Chapter {chapter_num} in full detail.
    """
    response = model.generate_content(prompt)
    content = response.text

    # Generate a summary for the next chapter's context
    summary_req = model.generate_content(
        f"Summarize this in 2 sentences: {content}")

    return content, summary_req.text


def generate_chapter_with_context(title, outline, chapter_num, history_summaries, editor_notes=""):
    # Combine all previous summaries into a single context block
    context_input = "\n".join(
        [f"Summary of Ch {i+1}: {s}" for i, s in enumerate(history_summaries)])

    prompt = f"""
    Using the following chapter summaries as context:
    {context_input}
    
    And based on this outline:
    {outline}
    
    Editor's specific notes for this chapter: {editor_notes}
    
    Write Chapter {chapter_num} of the book titled '{title}'. 
    Make it detailed and consistent with the previous parts.
    """

    response = model.generate_content(prompt)
    chapter_content = response.text

    # Generate summary for the NEXT chapter's context
    summary_resp = model.generate_content(
        f"Summarize Chapter {chapter_num} in 3 sentences: {chapter_content}")

    return chapter_content, summary_resp.text

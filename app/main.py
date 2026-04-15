
from fastapi import FastAPI, HTTPException
from app.models import BookCreate, OutlineReview
from app.services.gemini import generate_book_outline
from app.database import supabase
from .services.notifications import send_notification
from .services.gemini import generate_chapter_with_context

from fastapi.responses import StreamingResponse
from .services.compiler import compile_book_docx
from fastapi.responses import StreamingResponse
from .services.compiler import compile_book_docx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Allow your React/Next.js app
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers (Content-Type, etc.)
)


@app.post("/outline/generate")
async def start_outline_process(book: BookCreate):
    # Logic: Only generate outlines if notes_on_outline_before exists
    if not book.notes_on_outline_before:
        raise HTTPException(
            status_code=400, detail="Notes are required to start.")

    # Generate using Gemini
    outline_text = generate_book_outline(
        book.title, book.notes_on_outline_before)

    # Store in Supabase
    res = supabase.table("books").insert({
        "title": book.title,
        "notes_on_outline_before": book.notes_on_outline_before,
        "outline": outline_text,
        "status_outline_notes": "no"  # Default to pause for review
    }).execute()

    return {"message": "Outline created. System paused for review.", "book_id": res.data[0]['id']}


@app.post("/outline/review")
async def review_outline(review: OutlineReview):
    # Logic:
    # 'yes' -> Wait for notes (we just update the notes)
    # 'no_notes_needed' -> Proceed to chapters
    # 'no' -> Pause

    update_data = {"status_outline_notes": review.status_outline_notes}
    if review.notes_on_outline_after:
        update_data["notes_on_outline_after"] = review.notes_on_outline_after

    supabase.table("books").update(update_data).eq(
        "id", review.book_id).execute()

    if review.status_outline_notes == "no_notes_needed":
        return {"message": "Outline approved! You can now trigger Chapter 1."}
    else:
        return {"message": f"Status updated to {review.status_outline_notes}. System paused."}


@app.post("/chapters/generate/{book_id}")
async def trigger_chapter_generation(book_id: str, chapter_num: int):
    # 1. Fetch book & previous chapter summaries
    book = supabase.table("books").select(
        "*").eq("id", book_id).single().execute().data

    # Logic: Pause if outline isn't fully approved
    if book['status_outline_notes'] != 'no_notes_needed':
        raise HTTPException(
            status_code=400, detail="Outline must be approved first.")

    # 2. Get previous summaries for context chaining
    prev_chapters = supabase.table("chapters")\
        .select("summary")\
        .eq("book_id", book_id)\
        .lt("chapter_number", chapter_num)\
        .order("chapter_number")\
        .execute().data

    summaries = [c['summary'] for c in prev_chapters]

    # 3. AI Generation
    content, summary = generate_chapter_with_context(
        book['title'], book['outline'], chapter_num, summaries
    )

    # 4. Save & Notify
    supabase.table("chapters").insert({
        "book_id": book_id,
        "chapter_number": chapter_num,
        "content": content,
        "summary": summary,
        "chapter_notes_status": "no"
    }).execute()

    await send_notification(f"Chapter {chapter_num} for '{book['title']}' is ready for review!")

    return {"message": f"Chapter {chapter_num} generated.", "summary": summary}

app.post("/book/compile/{book_id}")


async def finalize_book(book_id: str):
    # 1. Fetch book status
    book = supabase.table("books").select(
        "*").eq("id", book_id).single().execute().data

    # 2. Logic: Only compile if review is 'no_notes_needed'
    # (Note: In your Supabase table, you might need a 'final_review_status' column)
    if book.get('status_outline_notes') != 'no_notes_needed':
        raise HTTPException(
            status_code=400, detail="Final review not completed.")

    # 3. Get all approved chapters
    chapters = supabase.table("chapters")\
        .select("chapter_number, content")\
        .eq("book_id", book_id)\
        .order("chapter_number")\
        .execute().data

    if not chapters:
        raise HTTPException(
            status_code=404, detail="No chapters found to compile.")

    # 4. Generate .docx using our compiler service
    file_stream = compile_book_docx(book['title'], chapters)

    # 5. Notify & Return File
    await send_notification(f"Final Draft for '{book['title']}' has been compiled!")

    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename={book['title']}.docx"}
    )


@app.get("/book/download/{book_id}")
async def download_book(book_id: str):
    # 1. Get Book Info
    book = supabase.table("books").select("title").eq(
        "id", book_id).single().execute().data

    # 2. Fetch all chapters in order
    chapters = supabase.table("chapters")\
        .select("chapter_number, content")\
        .eq("book_id", book_id)\
        .order("chapter_number")\
        .execute().data

    if not chapters:
        raise HTTPException(status_code=404, detail="No chapters found.")

    # 3. Create .docx file
    file_stream = compile_book_docx(book['title'], chapters)

    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename={book['title']}.docx"}
    )

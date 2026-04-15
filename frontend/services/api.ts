

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// POST /outline/generate
// Body: { title, notes_on_outline_before }
// Returns: { message, book_id }
export const generateOutline = (data: {
  title: string;
  notes_on_outline_before: string;
}) => api.post("/outline/generate", data);

// POST /outline/review
// Body: { book_id, status_outline_notes, notes_on_outline_after? }
// status_outline_notes: 'yes' | 'no' | 'no_notes_needed'
// Returns: { message }
export const reviewOutline = (data: {
  book_id: string;
  status_outline_notes: "yes" | "no" | "no_notes_needed";
  notes_on_outline_after?: string;
}) => api.post("/outline/review", data);

// POST /chapters/generate/{book_id}?chapter_num=N
// Returns: { message, summary }
export const generateChapter = (book_id: string, chapter_num: number) =>
  api.post(`/chapters/generate/${book_id}`, null, {
    params: { chapter_num },
  });

// GET /book/download/{book_id}
// Returns: .docx binary stream
export const downloadBook = (book_id: string) =>
  api.get(`/book/download/${book_id}`, { responseType: "blob" });

export default api;
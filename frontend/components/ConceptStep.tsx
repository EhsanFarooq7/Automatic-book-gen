
"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { generateOutline } from "@/services/api";
import axios from "axios";

interface Props {
    onSuccess: (bookId: string, outline: string, title: string) => void;
}

export default function ConceptStep({ onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!title.trim() || !notes.trim()) return;
        setError("");
        setLoading(true);
        try {
            const res = await generateOutline({
                title: title.trim(),
                notes_on_outline_before: notes.trim(),
            });
            // res.data = { message, book_id }
            // NOTE: backend returns book_id and outline from Supabase.
            // The outline text is stored in Supabase, not returned directly here.
            // We pass back what we have; OutlineStep will use book_id for review.
            onSuccess(res.data.book_id, res.data.outline ?? "", title.trim());
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                setError(e.response?.data?.detail || "Failed to generate outline. Try again.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="ab-step-title">Book concept</p>
            <p className="ab-step-desc">
                Give your book a title and describe what you want. The AI will draft a full
                chapter-by-chapter outline for your review.
            </p>

            {error && (
                <div className="ab-error" role="alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                </div>
            )}

            <div className="ab-field">
                <label className="ab-label" htmlFor="title">Book title</label>
                <input
                    id="title"
                    type="text"
                    className="ab-input"
                    placeholder="e.g. The Art of Focused Work"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="ab-field">
                <label className="ab-label" htmlFor="notes">
                    Notes for the outline <span>(required by backend)</span>
                </label>
                <textarea
                    id="notes"
                    className="ab-textarea"
                    placeholder="Describe chapters, themes, tone, audience, key ideas you want covered…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="ab-btn-row">
                <button
                    className="ab-btn ab-btn--primary"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !notes.trim() || loading}
                >
                    {loading ? (
                        <><span className="ab-spinner" /> Generating outline…</>
                    ) : (
                        <>Generate outline <ArrowRight size={14} strokeWidth={2} /></>
                    )}
                </button>
            </div>
        </div>
    );
}


"use client";
import { useState } from "react";
import { Check, ArrowLeft, MessageSquare } from "lucide-react";
import { reviewOutline } from "@/services/api";
import axios from "axios";

interface Props {
    bookId: string;
    outline: string;       // raw outline text from Gemini
    bookTitle: string;
    onApproved: () => void; // called when status === 'no_notes_needed'
    onBack: () => void;
}

export default function OutlineStep({ bookId, outline, bookTitle, onApproved, onBack }: Props) {
    const [mode, setMode] = useState<"view" | "notes">("view");
    const [afterNotes, setAfterNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Parse outline into lines for display
    const lines = outline
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

    const submitReview = async (status: "yes" | "no" | "no_notes_needed") => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const payload: Parameters<typeof reviewOutline>[0] = {
                book_id: bookId,
                status_outline_notes: status,
            };
            if (status === "yes" && afterNotes.trim()) {
                payload.notes_on_outline_after = afterNotes.trim();
            }
            const res = await reviewOutline(payload);
            if (status === "no_notes_needed") {
                onApproved();
            } else if (status === "yes") {
                setSuccess(res.data.message || "Notes submitted. System paused for editor.");
                setMode("view");
                setAfterNotes("");
            } else {
                setSuccess(res.data.message || "Status set to paused.");
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                setError(e.response?.data?.detail || "Failed to submit review.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Rough estimates from outline line count
    const chapterCount = lines.filter((l) => /^(chapter|\d+\.)/i.test(l)).length || Math.max(1, Math.round(lines.length / 2));
    const estWords = chapterCount * 2000;

    return (
        <div>
            <p className="ab-step-title">Review outline</p>
            <p className="ab-step-desc">
                AI-generated outline for <strong style={{ fontWeight: 500 }}>{bookTitle}</strong>. Approve
                it as-is, add editor notes for revision, or pause for later.
            </p>

            {error && (
                <div className="ab-error" role="alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                </div>
            )}

            {success && (
                <div className="ab-success" role="status">
                    <Check size={15} /> {success}
                </div>
            )}

            {/* Outline display */}
            <div className="ab-outline-box">
                {lines.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No outline text returned.</p>
                ) : (
                    lines.map((line, i) => (
                        <div key={i} className="ab-outline-item">
                            <span className="ab-outline-num">{i + 1}</span>
                            <span className="ab-outline-text">{line}</span>
                        </div>
                    ))
                )}
            </div>

            {/* Stats */}
            <div className="ab-stats">
                <div className="ab-stat">
                    <div className="ab-stat-val">{chapterCount}</div>
                    <div className="ab-stat-lbl">Chapters</div>
                </div>
                <div className="ab-stat">
                    <div className="ab-stat-val">~{Math.round(estWords / 1000)}k</div>
                    <div className="ab-stat-lbl">Est. words</div>
                </div>
                <div className="ab-stat">
                    <div className="ab-stat-val">~{Math.round(estWords / 275)}</div>
                    <div className="ab-stat-lbl">Est. pages</div>
                </div>
            </div>

            {/* Add notes section */}
            {mode === "notes" && (
                <div className="ab-review-section">
                    <span className="ab-review-label">Editor notes</span>
                    <textarea
                        className="ab-textarea"
                        placeholder="Describe what to change in the outline before chapter generation…"
                        value={afterNotes}
                        onChange={(e) => setAfterNotes(e.target.value)}
                        rows={3}
                        style={{ marginBottom: 10 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="ab-btn ab-btn--ghost" onClick={() => setMode("view")} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            className="ab-btn ab-btn--primary"
                            onClick={() => submitReview("yes")}
                            disabled={!afterNotes.trim() || loading}
                        >
                            {loading ? <><span className="ab-spinner" /> Submitting…</> : "Submit notes"}
                        </button>
                    </div>
                </div>
            )}

            {mode === "view" && (
                <div className="ab-btn-row" style={{ flexWrap: "wrap", gap: 8 }}>
                    <button className="ab-btn ab-btn--ghost" onClick={onBack} disabled={loading}>
                        <ArrowLeft size={14} strokeWidth={2} /> Back
                    </button>
                    <button
                        className="ab-btn ab-btn--ghost"
                        onClick={() => setMode("notes")}
                        disabled={loading}
                    >
                        <MessageSquare size={14} strokeWidth={2} /> Add notes
                    </button>
                    <button
                        className="ab-btn ab-btn--ghost"
                        onClick={() => submitReview("no")}
                        disabled={loading}
                    >
                        Pause
                    </button>
                    <button
                        className="ab-btn ab-btn--primary"
                        onClick={() => submitReview("no_notes_needed")}
                        disabled={loading}
                    >
                        {loading ? <><span className="ab-spinner" /> Approving…</> : <><Check size={14} strokeWidth={2} /> Approve &amp; continue</>}
                    </button>
                </div>
            )}
        </div>
    );
}
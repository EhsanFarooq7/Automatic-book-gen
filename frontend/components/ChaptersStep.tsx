

"use client";
import { useState } from "react";
import { Check, ArrowRight, Play, Loader2 } from "lucide-react";
import { generateChapter } from "@/services/api";
import axios from "axios";

interface Props {
    bookId: string;
    bookTitle: string;
    outline: string;        // to derive chapter count
    onNext: () => void;
}

interface ChapterState {
    num: number;
    label: string;
    status: "pending" | "generating" | "done" | "error";
    summary?: string;
    error?: string;
}

function parseChapterLabels(outline: string): string[] {
    const lines = outline.split("\n").map((l) => l.trim()).filter(Boolean);
    // Try to grab lines that look like chapter titles
    const chapterLines = lines.filter((l) =>
        /^(chapter\s+\d+|^\d+[\.\):])/i.test(l)
    );
    return chapterLines.length >= 2 ? chapterLines : lines.slice(0, Math.max(3, Math.round(lines.length / 2)));
}

export default function ChaptersStep({ bookId, bookTitle, outline, onNext }: Props) {
    const chapterLabels = parseChapterLabels(outline);
    const totalChapters = Math.max(chapterLabels.length, 1);

    const [chapters, setChapters] = useState<ChapterState[]>(
        Array.from({ length: totalChapters }, (_, i) => ({
            num: i + 1,
            label: chapterLabels[i] || `Chapter ${i + 1}`,
            status: "pending",
        }))
    );

    const [currentlyGenerating, setCurrentlyGenerating] = useState<number | null>(null);
    const [globalError, setGlobalError] = useState("");

    const doneCount = chapters.filter((c) => c.status === "done").length;
    const allDone = doneCount === totalChapters;
    const pct = Math.round((doneCount / totalChapters) * 100);

    const updateChapter = (num: number, patch: Partial<ChapterState>) => {
        setChapters((prev) => prev.map((c) => (c.num === num ? { ...c, ...patch } : c)));
    };

    const generateSingle = async (chapterNum: number) => {
        setGlobalError("");
        setCurrentlyGenerating(chapterNum);
        updateChapter(chapterNum, { status: "generating", error: undefined });
        try {
            const res = await generateChapter(bookId, chapterNum);
            // res.data = { message, summary }
            updateChapter(chapterNum, { status: "done", summary: res.data.summary });
        } catch (e: unknown) {
            let msg = "Generation failed.";
            if (axios.isAxiosError(e)) {
                msg = e.response?.data?.detail || msg;
            }
            updateChapter(chapterNum, { status: "error", error: msg });
        } finally {
            setCurrentlyGenerating(null);
        }
    };

    // Generate all chapters sequentially
    const generateAll = async () => {
        setGlobalError("");
        for (const ch of chapters) {
            if (ch.status === "done") continue;
            setCurrentlyGenerating(ch.num);
            updateChapter(ch.num, { status: "generating", error: undefined });
            try {
                const res = await generateChapter(bookId, ch.num);
                updateChapter(ch.num, { status: "done", summary: res.data.summary });
            } catch (e: unknown) {
                let msg = "Generation failed.";
                if (axios.isAxiosError(e)) {
                    msg = e.response?.data?.detail || msg;
                }
                updateChapter(ch.num, { status: "error", error: msg });
                setCurrentlyGenerating(null);
                setGlobalError(`Stopped at Chapter ${ch.num}: ${msg}`);
                return;
            }
        }
        setCurrentlyGenerating(null);
    };

    const anyGenerating = currentlyGenerating !== null;
    const hasAnyPending = chapters.some((c) => c.status === "pending" || c.status === "error");

    return (
        <div>
            <p className="ab-step-title">Generate chapters</p>
            <p className="ab-step-desc">
                Each chapter is written by Gemini with context from all previous summaries.
                Generate one at a time or run all sequentially.
            </p>

            {globalError && (
                <div className="ab-error" role="alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {globalError}
                </div>
            )}

            {/* Progress */}
            <div className="ab-progress-wrap">
                <div className="ab-progress-meta">
                    <span>Progress</span>
                    <span>{doneCount} / {totalChapters} chapters</span>
                </div>
                <div className="ab-progress-track">
                    <div className="ab-progress-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>

            {/* Run all button */}
            {hasAnyPending && (
                <div style={{ marginBottom: "1rem" }}>
                    <button
                        className="ab-btn ab-btn--ghost"
                        onClick={generateAll}
                        disabled={anyGenerating}
                        style={{ fontSize: 12, padding: "7px 14px" }}
                    >
                        {anyGenerating ? (
                            <><Loader2 size={12} style={{ animation: "ab-spin 0.65s linear infinite" }} /> Generating…</>
                        ) : (
                            <><Play size={12} strokeWidth={2} /> Generate all sequentially</>
                        )}
                    </button>
                </div>
            )}

            {/* Chapter list */}
            <div className="ab-chapter-list">
                {chapters.map((ch) => (
                    <div key={ch.num} className="ab-chapter-row">
                        <div className={`ab-ch-dot ab-ch-dot--${ch.status === "error" ? "pending" : ch.status === "generating" ? "active" : ch.status}`}>
                            {ch.status === "done" && <Check size={10} strokeWidth={2.5} />}
                            {ch.status === "generating" && (
                                <Loader2 size={10} style={{ animation: "ab-spin 0.65s linear infinite" }} />
                            )}
                            {ch.status === "error" && <span style={{ color: "var(--red)", fontSize: 9 }}>!</span>}
                        </div>

                        <div className="ab-ch-name" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span>{ch.label}</span>
                            {ch.summary && (
                                <span style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4 }}>
                                    {ch.summary.slice(0, 90)}{ch.summary.length > 90 ? "…" : ""}
                                </span>
                            )}
                            {ch.error && (
                                <span style={{ fontSize: 11, color: "var(--red)" }}>{ch.error}</span>
                            )}
                        </div>

                        <div className="ab-ch-action">
                            {ch.status === "done" ? (
                                <span className="ab-ch-words">Done</span>
                            ) : ch.status === "generating" ? (
                                <span className="ab-ch-words" style={{ color: "var(--amber)" }}>Writing…</span>
                            ) : (
                                <button
                                    className="ab-ch-btn"
                                    onClick={() => generateSingle(ch.num)}
                                    disabled={anyGenerating}
                                >
                                    {ch.status === "error" ? "Retry" : "Generate"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="ab-btn-row">
                <button
                    className="ab-btn ab-btn--primary"
                    onClick={onNext}
                    disabled={!allDone}
                >
                    Download book <ArrowRight size={14} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
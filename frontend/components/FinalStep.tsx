
"use client";
import { useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { downloadBook } from "@/services/api";
import axios from "axios";

interface Props {
    bookId: string;
    bookTitle: string;
    outline: string;
    onReset: () => void;
}

export default function FinalStep({ bookId, bookTitle, outline, onReset }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [downloaded, setDownloaded] = useState(false);

    const lines = outline.split("\n").map((l) => l.trim()).filter(Boolean);

    const handleDownload = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await downloadBook(bookId);
            // Trigger browser download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${bookTitle}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setDownloaded(true);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                setError(e.response?.data?.detail || "Download failed. Please try again.");
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="ab-step-title">Book complete</p>
            <p className="ab-step-desc">
                All chapters have been generated for{" "}
                <strong style={{ fontWeight: 500 }}>{bookTitle}</strong>. Download your
                finished manuscript as a Word document.
            </p>

            {error && (
                <div className="ab-error" role="alert">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {error}
                </div>
            )}

            {downloaded && (
                <div className="ab-success" role="status">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Download started — check your downloads folder.
                </div>
            )}

            {/* TOC from outline */}
            {lines.length > 0 && (
                <div className="ab-toc">
                    <p className="ab-toc-heading">Contents</p>
                    {lines.map((line, i) => (
                        <div key={i} className="ab-toc-row">
                            <span className="ab-toc-n">{i + 1}</span>
                            <span>{line}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Download button */}
            <button className="ab-dl-btn" onClick={handleDownload} disabled={loading}>
                {loading ? (
                    <><span className="ab-spinner" /> Preparing download…</>
                ) : (
                    <><Download size={17} strokeWidth={2} /> Download {bookTitle}.docx</>
                )}
            </button>

            <div className="ab-btn-row" style={{ marginTop: "1rem" }}>
                <button className="ab-btn ab-btn--ghost" onClick={onReset}>
                    <RotateCcw size={13} strokeWidth={2} /> Start new book
                </button>
            </div>
        </div>
    );
}
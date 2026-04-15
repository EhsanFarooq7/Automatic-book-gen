
"use client";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import ConceptStep from "@/components/ConceptStep";
import OutlineStep from "@/components/OutlineStep";
import ChaptersStep from "@/components/ChaptersStep";
import FinalStep from "@/components/FinalStep";

interface BookState {
  bookId: string;
  title: string;
  outline: string;  // raw Gemini text
}

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [book, setBook] = useState<BookState | null>(null);

  const reset = () => {
    setBook(null);
    setStep(1);
  };

  return (
    <main className="ab-shell">
      <div className="ab-container">
        {/* Header */}
        <header className="ab-header">
          <div className="ab-logo">
            <BookOpen size={18} strokeWidth={1.6} color="var(--amber)" />
          </div>
          <div className="ab-header-text">
            <h1>AutoBook</h1>
            <p>AI-powered · human-reviewed</p>
          </div>
        </header>

        {/* Card */}
        <div className="ab-card">
          <StepIndicator currentStep={step} />

          <div className="ab-card-body">
            {/* Step 1: Concept → calls POST /outline/generate */}
            {step === 1 && (
              <ConceptStep
                onSuccess={(bookId, outline, title) => {
                  setBook({ bookId, outline, title });
                  setStep(2);
                }}
              />
            )}

            {/* Step 2: Review outline → calls POST /outline/review */}
            {step === 2 && book && (
              <OutlineStep
                bookId={book.bookId}
                outline={book.outline}
                bookTitle={book.title}
                onApproved={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {/* Step 3: Generate chapters → calls POST /chapters/generate/{id}?chapter_num=N */}
            {step === 3 && book && (
              <ChaptersStep
                bookId={book.bookId}
                bookTitle={book.title}
                outline={book.outline}
                onNext={() => setStep(4)}
              />
            )}

            {/* Step 4: Download → calls GET /book/download/{id} */}
            {step === 4 && book && (
              <FinalStep
                bookId={book.bookId}
                bookTitle={book.title}
                outline={book.outline}
                onReset={reset}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
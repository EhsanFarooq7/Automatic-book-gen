

import { Check } from "lucide-react";

const STEPS = ["Concept", "Outline", "Chapters", "Download"];

interface Props {
    currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
    return (
        <div className="ab-steps" role="list" aria-label="Progress">
            {STEPS.map((label, i) => {
                const n = i + 1;
                const isDone = n < currentStep;
                const isActive = n === currentStep;
                const cls = `ab-step${isActive ? " ab-step--active" : ""}${isDone ? " ab-step--done" : ""}`;
                return (
                    <div key={n} className={cls} role="listitem" aria-current={isActive ? "step" : undefined}>
                        <div className="ab-step-num">
                            {isDone ? <Check size={11} strokeWidth={2.5} /> : n}
                        </div>
                        <span className="ab-step-label">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}
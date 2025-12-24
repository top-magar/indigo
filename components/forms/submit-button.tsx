"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
    pendingText?: string;
}

export function SubmitButton({
    children,
    pendingText = "Saving...",
    disabled,
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending || disabled} {...props}>
            {pending ? (
                <>
                    <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
                    {pendingText}
                </>
            ) : (
                children
            )}
        </Button>
    );
}

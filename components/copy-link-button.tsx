"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
}

export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleCopy}>
      {copied ? "✅ 복사됨!" : "🔗 링크 복사"}
    </Button>
  );
}

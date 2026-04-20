'use client';

import { useEffect } from "react";

import { touchSession } from "@/app/actions";

export function SessionBootstrap({ shareCode }: { shareCode?: string }) {
  useEffect(() => {
    void touchSession(shareCode).catch(() => {});
  }, [shareCode]);

  return null;
}


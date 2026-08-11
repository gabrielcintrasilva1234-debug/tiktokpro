"use client";
// Porta de entrada: manda pro login (que redireciona pra comunidade se ja estiver logado)
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return null;
}

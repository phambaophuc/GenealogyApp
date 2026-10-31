import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import ClanEmblem from "../components/ornaments/ClanEmblem";
import DrumPattern from "../components/ornaments/DrumPattern";
import PaperPanel from "../components/ornaments/PaperPanel";
import SealStamp from "../components/ornaments/SealStamp";
import { usePrefs } from "../hooks/usePrefs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { CLAN_PROFILE } from "../config/clan";
import { login, toErrorMessage } from "../services/api";

export default function Gate() {
  const navigate = useNavigate();
  const { simpleUI } = usePrefs();
  const [account, setAccount] = useState(
    import.meta.env.VITE_DEMO_EMAIL ?? "admin@example.com",
  );
  const [password, setPassword] = useState(
    import.meta.env.VITE_DEMO_PASSWORD ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const enter = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login(account.trim(), password);
      setLeaving(true);
      window.setTimeout(() => navigate("/ban-do"), simpleUI ? 0 : 700);
    } catch (loginError) {
      setError(toErrorMessage(loginError, "Không đăng nhập được."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-simple={simpleUI ? "true" : "false"}
      className="orn-paper relative flex min-h-screen items-center justify-center px-4 py-10"
    >
      <DrumPattern className="left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2" />

      <motion.div
        initial={simpleUI ? false : { opacity: 0, y: 26, rotateX: -8 }}
        animate={{
          opacity: leaving ? 0 : 1,
          y: leaving ? -20 : 0,
          rotateX: leaving ? 10 : 0,
        }}
        transition={{ duration: simpleUI ? 0 : 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <PaperPanel className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <ClanEmblem className="h-24 w-24" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-seal">
              Cổng làng
            </p>
            <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
              Gia phả số dòng họ
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {CLAN_PROFILE.village} · {CLAN_PROFILE.region}
            </p>
          </div>

          <form onSubmit={enter} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="account" className="text-base">
                Tài khoản
              </Label>
              <Input
                id="account"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="min-h-[48px] border-2 border-wood/40 bg-card text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-base">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="min-h-[48px] border-2 border-wood/40 bg-card text-base"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border-2 border-seal/50 bg-seal/10 px-3 py-2 text-sm font-medium text-seal"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="orn-plaque flex min-h-[56px] w-full items-center justify-center gap-2 bg-primary px-4 text-lg font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DoorOpen className="h-5 w-5" aria-hidden="true" />
              {busy ? "Đang mở cổng…" : "Vào làng"}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-center">
            <SealStamp label="Bản demo giao diện" />
            <p className="text-sm text-muted-foreground">
              Đăng nhập bằng tài khoản demo của API (mặc định:
              admin@example.com).
            </p>
          </div>
        </PaperPanel>
      </motion.div>
    </div>
  );
}

import { Lock } from "lucide-react";
import { usePrefs } from "../../hooks/usePrefs";
import type { Person } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";

export default function SensitiveBlock({ person }: { person: Person }) {
  const { viewMode } = usePrefs();
  const phone = person.phone;
  const address = person.currentAddress;
  const hasInfo = Boolean(phone || address);

  return (
    <PaperPanel className="p-5">
      <h2 className="font-heading text-xl font-semibold">Thông tin nhạy cảm</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Số điện thoại và địa chỉ riêng — chỉ hiện đầy đủ ở chế độ Quản trị.
      </p>

      {!hasInfo ? (
        <p className="mt-3 text-base text-muted-foreground">
          Hồ sơ này chưa có thông tin liên hệ.
        </p>
      ) : viewMode === "admin" ? (
        <dl className="mt-3 space-y-2 text-base">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-semibold text-muted-foreground">
              Điện thoại
            </dt>
            <dd>{phone ?? "chưa ghi"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-semibold text-muted-foreground">
              Địa chỉ
            </dt>
            <dd>{address ?? "chưa ghi"}</dd>
          </div>
          <p className="text-sm text-jade">
            Đang hiện đầy đủ vì bạn bật chế độ Quản trị.
          </p>
        </dl>
      ) : (
        <div className="mt-3 space-y-2">
          {["Điện thoại", "Địa chỉ"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border-2 border-wood/20 bg-secondary/60 px-3 py-2"
            >
              <Lock className="h-4 w-4 shrink-0 text-seal" aria-hidden="true" />
              <span className="font-semibold text-muted-foreground">
                {label}
              </span>
              <span className="select-none blur-sm" aria-hidden="true">
                0912 345 678 · Thôn Cổ Điền
              </span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            Bật chế độ Quản trị ở góc dưới màn hình để xem đầy đủ.
          </p>
        </div>
      )}
    </PaperPanel>
  );
}

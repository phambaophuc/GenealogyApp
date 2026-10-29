import { TriangleAlert } from "lucide-react";
import { missingFields } from "../../services/api";
import type { Person } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";

export default function MissingInfoNotice({ person }: { person: Person }) {
  const missing = missingFields(person);
  if (missing.length === 0) return null;

  return (
    <PaperPanel className="border-accent/60 p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert
          className="mt-0.5 h-5 w-5 shrink-0 text-seal"
          aria-hidden="true"
        />
        <div>
          <p className="font-heading text-lg font-semibold">
            Hồ sơ còn thiếu thông tin
          </p>
          <p className="mt-1 text-base">Cần bổ sung: {missing.join(", ")}.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Con cháu gửi ghi chú qua Hòm Thư (Giai đoạn 4); nhập trực tiếp ở
            trang quản trị (Giai đoạn 5).
          </p>
        </div>
      </div>
    </PaperPanel>
  );
}

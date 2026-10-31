import type { ClanStats } from "../../services/types";
import PaperPanel from "../ornaments/PaperPanel";

export default function TreeCompleteness({ stats }: { stats: ClanStats }) {
  return (
    <PaperPanel className="h-full p-5">
      <h2 className="font-heading text-xl font-semibold">
        Độ hoàn thiện của cây
      </h2>
      <p className="mt-3 font-heading text-5xl font-semibold leading-none text-seal">
        {stats.completeness}%
      </p>

      <div
        className="mt-4 h-4 w-full overflow-hidden rounded-full border-2 border-wood/30 bg-secondary"
        role="progressbar"
        aria-valuenow={stats.completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Độ hoàn thiện của cây phả hệ"
      >
        <div
          className="h-full bg-accent"
          style={{ width: `${stats.completeness}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Còn{" "}
        <span className="font-semibold text-foreground">
          {stats.missingInfo} lượt thông tin
        </span>{" "}
        cần bổ sung (quê quán, tiểu sử, ngày giỗ âm lịch…). Hồ sơ thiếu được
        đánh dấu chấm than ngay trong trang hồ sơ.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Hồ sơ chưa có ảnh chân dung sẽ dùng chữ cái đầu thay thế.
      </p>
    </PaperPanel>
  );
}

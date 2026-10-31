import type { ClanInfo } from "../services/types";

/**
 * Clan branding (family name, village, motto, founding note) is not part of the
 * persons/tree API yet. Keeping it here means the services layer contains no
 * mock records — only real HTTP calls.
 */
export const CLAN_PROFILE: ClanInfo = {
  familyName: "Phạm",
  village: "Cẩm Giàng, Hải Dương",
  region: "Bắc Bộ",
  motto: "Uống nước nhớ nguồn — con cháu ghi lòng công đức tổ tiên.",
  foundedNote: "Phả ký dựng từ đời cụ tổ họ Phạm, năm 1802.",
};

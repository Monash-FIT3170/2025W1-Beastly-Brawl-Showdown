import type { OrderedEvent } from "@beastly-brawl-showdown/sim-core/event/event_history";
import type { Notice, NoticeKind } from "@beastly-brawl-showdown/sim-core/notice/notice";
import type { SideId } from "@beastly-brawl-showdown/sim-core/side";

export interface ServerToPlayerEvents {
  newEvent: (event: OrderedEvent) => void;
  newNotice: (notice: Notice) => void;
}
export interface PlayerToServerEvents {
  /// Extract the notice type that matches the kind=K requirement, then get the callback Params
  resolveNotice<K extends NoticeKind>(kind: K, params: Parameters<Extract<Notice, { kind: K }>["callback"]>): void;
  getHistory(): OrderedEvent[];
  getSelfInfo(): SideId;
  getNotices(): Notice[];
}

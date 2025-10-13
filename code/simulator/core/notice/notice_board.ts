import { NoticeKind, Notice } from "./notice";

type NoticeBoardListener = {
  onPostNotice(target: number, notice: Notice): void;
  onRemoveNotice(target: number, notice: Notice): void;
};

type NoticeMap = Map<NoticeKind, Notice>;
export class NoticeBoard {
  noticeMaps: NoticeMap[];
  listeners: NoticeBoardListener[];

  constructor(playerCount: number) {
    this.noticeMaps = Array.from({ length: playerCount }, () => new Map<NoticeKind, Notice>());
    this.listeners = [];
  }

  postNotice(target: number, notice: Notice): void {
    this.noticeMaps[target].set(notice.kind, notice);
    this.emitOnPostNotice(target, notice);
  }
  removeNotice(target: number, noticeKind: NoticeKind): Notice | null {
    const notice: Notice | null = this.noticeMaps[target].get(noticeKind) || null;

    if (!notice) {
      console.log(`${target} does not have a notice: ${noticeKind}`);
      return null;
    }
    this.noticeMaps[target].delete(noticeKind);
    this.emitOnRemoveNotice(target, notice);
    return notice;
  }

  subscribeListener(listener: NoticeBoardListener) {
    this.listeners.push(listener);
  }
  unsubscribeListener(listener: NoticeBoardListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emitOnPostNotice(target: number, notice: Notice) {
    this.listeners.forEach((listener) => {
      listener.onPostNotice(target, notice);
    });
  }
  private emitOnRemoveNotice(target: number, notice: Notice) {
    this.listeners.forEach((listener) => {
      listener.onRemoveNotice(target, notice);
    });
  }
}

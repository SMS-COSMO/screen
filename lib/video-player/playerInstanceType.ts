interface Player2 { // 因为在 VideoPlayer 里面是叫这个名字
  src: (source?: string) => string | void; // 如果 source 留空，则返回当前 src；否则设置 src 为输入的 source
  play: () => Promise<void>; // 如果播放失败（例如用户没有和页面进行过交互），可以调用 catch 获取错误信息
  pause: () => void;
  currentTime: (seconds?: number) => number | void; // 如果 seconds 留空，则返回当前时间；否则设置当前时间为输入的 seconds
  duration: () => number;

  // debug: (enabled: any) => void; // ?

  player: () => Player2; // 获取当前 player 实例

  // setState: (state: Partial<TPlayerInstance['state']>) => void; // ?
}

interface TPlayerInstance {
  player: Player2;
  state: {
    // canplay: boolean; //
    // canplaythrough: boolean; //

    playing: boolean;
    waiting: boolean; // 当获取的新数据不足以支持播放时，这个值为 true
    paused: boolean;
    currentTime: number;
    duration: number;
  };
  video: HTMLVideoElement;
}

export type { TPlayerInstance };


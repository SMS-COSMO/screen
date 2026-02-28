interface ErrorDisplay2 { // 因为在 VideoPlayer 里面是叫这个名字
  close: () => void; // 这将隐藏错误信息和中间的 X
  open: () => void;
  el: () => HTMLElement; // 返回用于显示错误的元素。并没有提供修改这个元素的接口
}

interface Player2 { // 因为在 VideoPlayer 里面是叫这个名字
  src: (source?: string) => string | void; // 如果 source 留空，则返回当前 src；否则设置 src 为输入的 source
  play: () => Promise<void>; // 如果播放失败（例如用户没有和页面进行过交互），可以调用 catch 获取错误信息
  pause: () => void;
  currentTime: (seconds?: number) => number | void; // 如果 seconds 留空，则返回当前时间；否则设置当前时间为输入的 seconds
  duration: () => number;

  error: (err?: number | string) => MediaError | null | undefined; // 如果 err 留空，则返回当前错误信息；否则根据传入的 err 生成错误（但并不会中止视频播放）
  errorDisplay: ErrorDisplay2; // VideoPlayer 用这个显示内置的错误页面

  // on: (type: string, listener: () => void) => void; // 监听事件
  // off: (type: string, listener: () => void) => void; // 取消监听事件

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


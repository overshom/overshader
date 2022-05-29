export const handleCanvasResize = (
  canvas: HTMLCanvasElement,
  parent: HTMLElement,
  devicePixelRatio = window.devicePixelRatio,
) => {
  const onParentResize = () => {
    const ratio = devicePixelRatio;
    canvas.width = parent.offsetWidth * ratio;
    canvas.height = parent.offsetHeight * ratio;
    canvas.style.width = `${canvas.width / ratio}px`;
    canvas.style.height = `${canvas.height / ratio}px`;
    // console.log("resize", parent, parent.offsetWidth, parent.offsetHeight);
  };
  onParentResize();
  let timer: number;
  const requestResize = () => {
    if (timer) {
      clearTimeout(timer);
    }
    // use timer to avoid rendering glitches
    timer = window.setTimeout(() => {
      onParentResize();
    }, 5);
  };
  new ResizeObserver(requestResize).observe(parent);
};

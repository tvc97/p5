let mic,
  fft,
  frame = 0;
let WIDTH, HEIGHT, NCOL, NROW, HSPACING, VSPACING, WCELL, HCELL;
const BOARD_PADDING = 12;
const head = [...Array(1024)].map(() => ({
  value: 0,
  duration: 0
}));

function init() {
  (WIDTH = window.innerWidth),
    (HEIGHT = window.innerHeight),
    (NCOL = 32),
    (NROW = 48),
    (HSPACING = WIDTH / NCOL / 10),
    (VSPACING = WIDTH / NROW / 10),
    (WCELL = (WIDTH - HSPACING * 2) / NCOL - HSPACING),
    (HCELL = (HEIGHT - VSPACING * 2) / NROW - VSPACING);
}

function setup() {
  init();

  cnv = createCanvas(WIDTH, HEIGHT);
  noFill();
  cnv.mousePressed(userStartAudio);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);
}

function draw() {
  background(0);

  translate(HSPACING, VSPACING);

  let spectrum = fft.analyze();
  spectrum.forEach((value, index) => {
    if (value > head[index].value) {
      head[index].value = value;
      head[index].duration = 0;
    } else {
      head[index].value--;
    }
  });

  // rgba(255,83,0,1) 17%
  // rgba(243,189,1,1) 48%
  // rgba(0,255,19,1) 100%

  noStroke();
  for (let i = 0; i < NCOL; i++) {
    index = floor(map(i, 0, NCOL, 0, (spectrum.length * 3) / 4, true));
    value = map(spectrum[index], 0, 255, 0, NROW);
    mv = ceil(map(head[index].value, 0, 255, 0, NROW));

    for (let j = 0; j < NROW; j++) {
      isActive = NROW - j <= value || NROW - j == mv;
      av = isActive ? 255 : 50;
      fc = null;

      if (j < NROW / 2) {
        fc = color(
          map(j, 0, NROW / 2, 255, 243),
          map(j, 0, NROW / 2, 83, 189),
          1,
          av
        );
      } else {
        fc = color(
          map(j, NROW / 2, NROW, 243, 0),
          map(j, NROW / 2, NROW, 189, 255),
          1,
          av
        );
      }

      if (isActive) {
        drawingContext.shadowBlur = VSPACING * 2;
        drawingContext.shadowColor = fc;
      } else {
        drawingContext.shadowBlur = 0;
      }
      fill(fc);
      rect(i * (WCELL + HSPACING), j * (HCELL + VSPACING), WCELL, HCELL);
    }
  }

  frame++;
}

function windowResized() {
  init();

  resizeCanvas(windowWidth, windowHeight);
}

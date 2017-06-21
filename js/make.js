var LINKS = {
  MAINMENU: "/index.html",
};
var id_counter = 0;
var draw_items = {};
function add2Draw(obj) {
  obj.idid = id_counter;
  draw_items[id_counter] = obj;
  id_counter += 1;
}
var cols = [];

var stuffLoaded = {};

var player = {
  playing: false,
  bpm: 120,
  bmp_min: 80,
  bpm_max: 500,
  bpm_default: 120,
  step: 0,
  frameRate: 60,
  showFPS: false,
  currcol: 0,
  volume: 0.4,
  fadeRate: 0.01,
  proceedOnStep: 0,
  getSteps: function(figure) {
    var bps = player.bpm/60;
    return player.frameRate * 1/bps * figure.duration;
  },
  playback_start: function() {
    player.playing = true;
    player.currcol = 0;
    player.step = 0
    player.proceedOnStep = 0;
    cols[player.currcol].playplay();
  },
  playback_update: function() {
    if (!player.playing) {return;}
    if (player.step >= player.proceedOnStep) {
      player.currcol += 1;
      if (player.currcol < cols.length) {
        cols[player.currcol].playplay();
      }
      else {
        player.playback_start();
        // player.playback_stop();
      }
    }
  },
  playback_stop: function() {
    player.playing = false;
    player.step = -1;
    for (var i = 0; i < soundsounds.length; i++) {
      soundsounds[i].stopstop();
    }
  },
};
var noteSounds = [];
var NoteSound = function(letter, name, freq, octave) {
  this.letter = letter;
  this.name = name;
  this.freq = freq;
  this.octave = octave;
};
var soundsounds = [];
var Soundsound = function(noteSound, waveform) {
  this.noteSound = noteSound;
  this.osc = new p5.Oscillator();
  this.waveform = waveform || 'sine';
  this.stopOnStep = 0;
  this.osc.setType(this.waveform);
  this.osc.freq(noteSound.freq);
  this.osc.amp(player.volume);
  soundsounds.push(this);
};
Soundsound.prototype.update = function() {
  if (player.step >= this.stopOnStep) {
    this.stopstop();
  }
};
Soundsound.prototype.playplay = function(figure) {
  var totsteps = player.step + player.getSteps(figure);
  if (!figure.isRest) {
    this.osc.amp(player.volume, player.fadeRate);
    this.osc.start()
  }
  this.stopOnStep = totsteps;
  if (totsteps > player.proceedOnStep) {
    player.proceedOnStep = totsteps;
  }
};
Soundsound.prototype.stopstop = function() {
  this.osc.amp(0, player.fadeRate);
}

var music = {
  letters: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  names: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  freqs:  [261.63,293.66,329.63,349.23,392.00,440.00,493.88],
};
(music.init = function musicinit() {
  var octave_counter = 0;
  var octave_current = 1;
  var notes_n = music.letters.length;
  for (var i = 0; i < 30; i++) {
    noteSounds.push(new NoteSound(music.letters[i%notes_n], music.names[i%notes_n], music.freqs[i%notes_n]*octave_current, octave_current));
    octave_counter += 1;
    if (octave_counter >= notes_n) {
      octave_counter = 0;
      octave_current += 1;
    }
  }
})();

var Figure = function(name, duration, isRest, paf, img_number, width_factor, height_factor) {
  this.name = name;
  this.duration = duration;
  this.isRest = isRest;
  this.paf = paf;
  this.img_number = img_number;
  this.width_factor = width_factor || 1;
  this.height_factor = height_factor || 1;
};
var notes = {
  1: new Figure("Whole", 4, false, "assets/whole_note00.png", 4),
  2: new Figure("Half", 2, false, "assets/half_note00.png", 4),
  4: new Figure("Quarter", 1, false, "assets/quarter_note00.png", 4),
  8: new Figure("Eighth", 0.5, false, "assets/eighth_note00.png", 4),
};
var rests = {
  1: new Figure("Whole", 4, true, "assets/whole_rest00.png", 4),
  2: new Figure("Half", 2, true, "assets/half_rest00.png", 4),
  4: new Figure("Quarter", 1, true, "assets/quarter_rest00.png", 5),
  8: new Figure("Eighth", 0.5, true, "assets/eighth_rest00.png", 4),
};

Figure.prototype.get_gif = function(x, y, size){
  size = size || this.width_factor;
  return new Gif(this.paf, this.img_number, x, y, size, size);
};

var user = {
  figure: null,
  figure_gif: null,
  cuscursor: null,
  cuscursor_size: 1,
  cursor_figure_size: 0.6,
};
user.changeFigure = function(figure) {
  var that = this;
  if (this.figure_gif && this.figure_gif.deldel) {
    this.figure_gif.deldel();
  }
  this.figure = figure;
  this.figure_gif = figure.get_gif(mouseX, mouseY);
  this.figure_gif.width_factor = user.cursor_figure_size;
  this.figure_gif.height_factor = user.cursor_figure_size;
  this.figure_gif.update = function() {
    that.figure_gif.x = mouseX - that.figure_gif.w();
    that.figure_gif.y = mouseY;
  };
};

var Cell = function(soundsound, x,y, parent) {
  var that = this;
  this.soundsound = soundsound;
  this.figure = null;
  this.figure_gif = null;
  this.parent = parent;
  size = 1;
  this.gif = new Gif("assets/square00.png", 5, x, y, size, size, false);
  this.gif.tint = function() {
    var mdist = utils.distance(that.gif.x+that.gif.w()/2, that.gif.y+that.gif.h()/2, mouseX, mouseY);
    if (that.gif.hovered()) {
      tint(100,100,100,255);
    }
    else if (mdist < 200) {
      tint(1/mdist * 60, 1/mdist * 1600);
    }
    else {
      tint(255, 0);
    }
  };
  this.removeFigure = function() {
    that.figure = null;
    if (that.figure_gif) {
      that.figure_gif.deldel();
    }
    that.figure_gif = null;
  };
  this.attachFigure = function() {
    that.figure = user.figure;
    that.figure_gif = user.figure.get_gif(that.gif.x, that.gif.y);
  };
  this.gif.whenclicked = function() {
    if (that.gif.hovered()) {
      if (that.figure) {
        that.removeFigure();
      }
      else if (user.figure) {
        if (!user.figure.isRest) {
          that.attachFigure();
        }
        else {
          that.parent.attachRest();
        }
      }
    }
  };
  this.playplay = function() {
    if (this.figure) {
      that.soundsound.playplay(this.figure);
    }
  };
};

var Column = function(x) {
  this.x = x;
  this.maincell = null;
  this.cells = [];
  for (var i = 0; i < Column.N_NOTES; i++) {
    var spac = pentagram.lines_offset/2;
    var s = new Soundsound(noteSounds[10-i]);
    var c = new Cell(s, x, pentagram.y+(spac+5)*i-6, this);
    this.cells.push(c);
    if (i < Column.N_NOTES/2) {
      this.maincell = c;
    }
  }
};
Column.prototype.attachRest = function() {
  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i].removeFigure();
  }
  this.maincell.attachFigure();
};
Column.prototype.playplay = function() {
  for (var i = 0; i < this.cells.length; i++) {
    this.cells[i].playplay();
  }
};
Column.N_NOTES = 11;

var Selector = function(figure, path, img_number, x, y, width_factor, height_factor, centered) {
  var that = this;
  this.gif = new Gif(path, img_number, x, y, width_factor, height_factor, centered);
  this.figure = figure;
  this.gif.whenclicked = function() {
    if (that.gif.hovered()) {
      user.changeFigure(that.figure);
    }
  };
};


var Gif = function(path, img_number, x, y, width_factor, height_factor, centered) {
  var that = this;
  this.path = path;
  this.path_reg = /(.*).\.(...)$/.exec(this.path);
  this.path_1 = this.path_reg[1];
  this.path_ext = this.path_reg[2];
  this.imgs = [];
  this.loaded = false;
  this.n_loaded = 0;
  this.ani_index = 0;
  this.ani_index_float = 0;
  this.ani_speed = 51/player.frameRate;
  this.img_number = img_number;
  this.x = x;
  this.y = y;
  this.width_factor = width_factor || 1;
  this.height_factor = height_factor || 1;
  this.centered = centered || false;
  this.tint = null;
  this.whenclicked = null;
  this.hidehide = false;
  Gif.gifs.push(this);
  add2Draw(this);
  if (path) {
    for (var i = 0; i < this.img_number; i++) {
      var tpath = function(n) {return that.path_1 + n + '.' + that.path_ext;};
      var fload = function(imgimg) {
        that.n_loaded += 1;
        if (that.n_loaded >= that.img_number) {
          that.loaded = true;
          for (var i = 0; i < that.imgs.length; i++) {
            stuffLoaded[tpath(i)] = that.imgs[i];
          }
        }
      };
      if (stuffLoaded[tpath(i)]) {
        this.imgs[i] = stuffLoaded[tpath(i)];
        fload();
      }
      else {
        this.imgs[i] = loadImage(tpath(i), fload);
      }
    }
  }
  else {
    that.loaded = true;
  }
};
Gif.prototype.hovered = function(){
  if (!this.loaded || this.hidehide) {return false;}
  if (this.centered) {
    var w2 = this.w()/2;
    var h2 = this.h()/2;
    return utils.pointInRegion(mouseX, mouseY, this.x-w2, this.y-h2, this.w(), this.h());
  }
  else {
    return utils.pointInRegion(mouseX, mouseY, this.x, this.y, this.w(), this.h());
  }
};
Gif.prototype.drawdraw = function() {
  if (!this.loaded || this.hidehide) {return;}
  this.ani_index_float += this.ani_speed/15;
  if (this.ani_index_float > this.img_number) {
    this.ani_index_float = 0;
  }
  this.ani_index = Math.floor(this.ani_index_float);
  this.curimg = this.imgs[this.ani_index];
  if (this.tint) {
    this.tint();
  }
  if (this.centered) {
    image(this.curimg, this.x-this.w()/2, this.y-this.h()/2, this.w(), this.h());
  }
  else {
    image(this.curimg, this.x, this.y, this.w(), this.h());
  }
  tint(255, 255);
};
Gif.prototype.deldel = function() {
  delete draw_items[this.idid];
};
Gif.prototype.w = function(){
  return this.curimg.width*this.width_factor;
};
Gif.prototype.h = function(){
  return this.curimg.height*this.height_factor;
};
Gif.gifs = [];

var gameview = {
  cnv: null,
  x: 0,
  y: 0,
  center: function() {
    this.x = (windowWidth-width)/2;
    this.y = (windowHeight-height)/2;
    this.cnv.position(this.x, this.y);
    layout.center.call(layout);
  }
};

var pentagram = {
  x: 10,
  y: 10,
  sep: 70,
  gclef: null,
  lines: [],
  lines_n: 5,
  lines_offset: 60,
  loadload: function() {
    // G CLEF
    this.gclef = new Gif("assets/p_gclef00.png", 3, this.x, this.y + this.sep*0.5);
    for (var i = 0; i < this.lines_n; i++) {
      this.lines[i] = loadImage("assets/p_line" + i + ".png");
    }
  },
  drawdraw: function() {
    for (var i = 0; i < this.lines.length; i++) {
      image(this.lines[i], this.x+this.lines_offset, this.y + this.sep*i, width-this.lines_offset-80);
    }
    // image(this.gclef, this.x, this.y + this.sep*1.2);
  }
};

var layout = {
  selectors: {
    x: 140,
    x_sep: 88,
    size: 1,
    y: pentagram.sep*pentagram.lines_n+110,
    y_sep: 90,
  },
  font_1: null,
  init: function() {
    add2Draw(this);
    //border
    new Gif("assets/selectors_border00.png", 5, 92, 412);
    // buttons
    this.playbutt = new Playbutt(505+40, 412);
    // exit
    this.exitbutt = new Button("assets/button_exit00.png", this.playbutt.x + 140, this.playbutt.y, function() {
      window.location.href = LINKS.MAINMENU;
    });
    // bpm slider
    this.bpm_slider_size = 280;
    this.bpm_slider_x = 520;
    this.bpm_slider_y = height-50;
    this.bpm_slider = createSlider(player.bmp_min, player.bpm_max, player.bpm_default, 5);
    this.bpm_slider.style('width', this.bpm_slider_size + 'px');
    this.center();
  },
  center: function() {
    if (this.bpm_slider) {
      this.bpm_slider.position(gameview.cnv.position().x+this.bpm_slider_x, gameview.cnv.position().y+this.bpm_slider_y);
    }
  },
  drawdraw: function() {
    textSize(26);
    textAlign(CENTER);
    textFont(this.font_1);
    text(player.bpm + " BPM", this.bpm_slider_x+this.bpm_slider_size/2, this.bpm_slider_y-10);
    if (player.showFPS) {
      text("FPS: " + Math.round(frameRate()), width-100, 40);
    }
  },
  update: function() {
    player.bpm = this.bpm_slider.value();
  },
};

var Button = function(paf, x, y, action) {
  var that = this;
  this.x = x;
  this.y = y;
  this.gif = new Gif(paf, 4, x, y);
  this.gif.whenclicked = function() {
    if (that.gif.hovered()) {
      action(that);
    }
  };
}

var Playbutt = function(x, y) {
  var that = this;
  add2Draw(this);
  this.x = x;
  this.y = y;
  this.sprite_play = new Gif("assets/button_play00.png", 5, x, y);
  this.sprite_stop = new Gif("assets/button_stop00.png", 5, x, y);
  this.sprite_stop.hidehide = true;
  this.hitplay = function() {
    that.sprite_play.hidehide = !that.sprite_play.hidehide;
    that.sprite_stop.hidehide = !that.sprite_stop.hidehide;
    if (!player.playing) {
      player.playback_start();
    }
    else {
      player.playback_stop();
    }
  };
  this.whenclicked = function() {
    if (!that.sprite_play.hovered() && !that.sprite_stop.hovered()) {return;}
    this.hitplay();
  }
};

function preload() {
  layout.font_1 = loadFont("assets/Indie_Flower/IndieFlower.ttf");
}

function setup() {
  gameview.cnv = createCanvas(880, 600);
  gameview.center();
  pentagram.loadload();
  layout.init();
  frameRate(player.frameRate);
  noCursor();
  user.cuscursor = new Gif("assets/mouse00.png", 5, mouseX, mouseY, user.cuscursor_size, user.cuscursor_size);
  user.cuscursor.update = function() {
    this.x = mouseX;
    this.y = mouseY;
  };
  // create selectors
  var k;
  var i = 0;
  for (k in notes) {
    new Selector(notes[k], notes[k].paf, notes[k].img_number, layout.selectors.x+i*layout.selectors.x_sep, layout.selectors.y, layout.selectors.size, layout.selectors.size, true);
    i += 1;
  }
  i = 0;
  for (k in rests) {
    new Selector(rests[k], rests[k].paf, rests[k].img_number, layout.selectors.x+i*layout.selectors.x_sep, layout.selectors.y + layout.selectors.y_sep, layout.selectors.size, layout.selectors.size, true);
    i += 1;
  }
  // -------------
  var columns_number = 6;
  var columns_x = 240;
  var columns_x_sep = 90;
  for (i = 0; i < columns_number; i++) {
    cols.push(new Column(columns_x + i*columns_x_sep));
  }
}

var mills = 0;
var prevmills = 0;
function draw() {
  clear();
  mills = performance.now();
  player.step += (mills - prevmills)/(1000/player.frameRate);
  prevmills = performance.now();
  pentagram.drawdraw();
  for (var k in draw_items) {
    if (typeof(draw_items[k].loaded) === "undefined" || draw_items[k].loaded) {
      if (draw_items[k].drawdraw) {
        draw_items[k].drawdraw();
      }
      if (draw_items[k].update) {
          draw_items[k].update();
      }
    }
  }
  for (var i = 0; i < soundsounds.length; i++) {
    soundsounds[i].update();
  }
  player.playback_update();
  if (player.playing) {
    line(cols[player.currcol].x+20, 10, cols[player.currcol].x, 400);
  }
}


function windowResized() {
  gameview.center();
}

function mouseClicked() {
  for (var k in draw_items) {
    if (draw_items[k].whenclicked) {
      draw_items[k].whenclicked();
    }
  }
}

function keyPressed() {
  // console.log(keyCode);
  if (keyCode === 32) {
    layout.playbutt.hitplay();
  }
  else if (keyCode === 70) {
    player.showFPS = !player.showFPS;
  }
  // return false;
}

var utils = {
  pointInRegion: function(x, y, rx, ry, rw, rh) {
    return x>rx && x<rx+rw && y>ry && y<ry+rh;
  },
  distance: function(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  }
};

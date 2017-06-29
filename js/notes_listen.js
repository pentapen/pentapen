var LINKS = {
  MAINMENU: "/main.html",
};
var id_counter = 0;
var draw_items = {};
function add2Draw(obj) {
  obj.idid = id_counter;
  draw_items[id_counter] = obj;
  id_counter += 1;
}

var stuffLoaded = {};
var fcounter = 0;

var player = {
  score: 0,
  tries: 0,
  playing: false,
  frameRate: 60,
  showFPS: false,
  volume: 0.4,
  fadeRate: 0.01,
  playback_duration: 1,  // seconds
  picked: null,
  playback_on: true,
  cooldown_rate: 1.6,  // seconds
  playNote: function() {
    this.picked.soundsound.playplay();
  },
  pickSecretNote: function() {
    this.picked = layout.cells[Math.floor(Math.random()*layout.cells.length)];
    this.playNote();
  },
  cooldown: function(pickAnother) {
    this.playback_on = false;
    setTimeout(function() {
      if (pickAnother) {
        player.pickSecretNote();
      }
      player.playNote();
      setTimeout(function() {player.playback_on = true;}, (player.playback_duration + 0.1)*1000);
    }, player.cooldown_rate*1000);
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
  this.playing = false;
  this.osc.setType(this.waveform);
  this.osc.freq(noteSound.freq);
  this.osc.amp(player.volume);
  soundsounds.push(this);
};
Soundsound.prototype.playplay = function(figure) {
  if (this.playing) {return;}
  this.playing = true;
  var that = this;
  this.osc.amp(player.volume, player.fadeRate);
  this.osc.start();
  clearInterval(this.timeout);
  this.timeout = setTimeout(function() {
    that.osc.amp(0, player.fadeRate);
    that.playing = false;
  }, player.playback_duration*1000);
};

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

Figure.prototype.get_gif = function(x, y, size){
  size = size || this.width_factor;
  return new Gif(this.paf, this.img_number, x, y, size, size);
};

var user = {
  cuscursor: null,
  cuscursor_size: 1,
  cursor_figure_size: 0.6,
};

var Cell = function(soundsound, x,y) {
  var that = this;
  this.soundsound = soundsound;
  size = 1;
  this.gif = notes[1].get_gif(x, y, size)
  this.gif.tint = function() {
    if (that.gif.hovered()) {
      tint(100,100,100,255);
    }
    else {
      tint(255, 100);
    }
  };
  this.gif.update = function() {
    if (that.gif.hovered()) {
      var posx = that.gif.x + 100;
      var posy = that.gif.y;
      noStroke();
      fill(color(255, 150));
      rect(posx-20, posy-2, 60, 40);
      textSize(28);
      textFont(layout.font_1);
      textAlign(LEFT, TOP);
      fill(color(0));
      text(that.soundsound.noteSound.name, that.gif.x + 100, that.gif.y);
    }
  }
  this.gif.whenclicked = function() {
    if (that.gif.hovered() && player.playback_on) {
      that.soundsound.playplay();
      if (player.picked) {
        player.tries += 1;
        if (player.picked == that) {
          player.score += 1;
          player.cooldown(true);
          new PropertyChanger(that.gif, "y", function(targ) {
            targ.y += Math.sin((this.fcounter_ini - fcounter)/6) * 10;
          }, 38);
        }
        else {
          new PropertyChanger(that.gif, "x", function(targ) {
            targ.x += Math.sin(fcounter) * 5;
          }, 45);
          player.cooldown(false);
        }
      }
    }
  };
};
var PropertyChanger = function(forWhom, prop, func, duration) {
  // duration is frames
  add2Draw(this);
  var that = this;
  this.prop_ini = forWhom[prop];
  this.fcounter_ini = fcounter;
  this.drawdraw = function() {
    func.call(that, forWhom);
    if ((fcounter - that.fcounter_ini) > duration) {
      delete draw_items[this.idid];
      forWhom[prop] = that.prop_ini;
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
    // clickable notes
    this.cells = [];
    this.N_NOTES = 11;
    for (var i = 0; i < this.N_NOTES; i++) {
      var spac = pentagram.lines_offset/2;
      var s = new Soundsound(noteSounds[10-i]);
      var c = new Cell(s, width-250-(i*40), pentagram.y+(spac+5)*i-6, this);
      this.cells.push(c);
    }
  },
  center: function() {
    console.log('a');
  },
  drawdraw: function() {
    textSize(32);
    textAlign(CENTER, CENTER);
    textFont(this.font_1);
    text("Puntaje: " + player.score + " / " + player.tries, 265, height-110);
    if (player.showFPS) {
      textSize(26);
      text("FPS: " + Math.round(frameRate()), width-100, 40);
    }
  },
  update: function() {
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
    if (that.sprite_play.hidehide || !player.picked || !player.playback_on) {return;}
    that.sprite_play.hidehide = !that.sprite_play.hidehide;
    that.sprite_stop.hidehide = !that.sprite_stop.hidehide;
    setTimeout(function() {
      that.sprite_play.hidehide = !that.sprite_play.hidehide;
      that.sprite_stop.hidehide = !that.sprite_stop.hidehide;
    }, player.playback_duration);
    player.picked.soundsound.playplay();
  };
  this.whenclicked = function() {
    if (that.sprite_play.hovered()) {
      this.hitplay();
    }
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
  player.cooldown(true);
}

function draw() {
  clear();
  fcounter += 1;
  pentagram.drawdraw();
  for (var k in draw_items) {
    if (typeof(draw_items[k].loaded) === "undefined" || draw_items[k].loaded) {
      if (draw_items[k] && draw_items[k].drawdraw) {
        draw_items[k].drawdraw();
      }
      if (draw_items[k] && draw_items[k].update) {
          draw_items[k].update();
      }
    }
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
}

var utils = {
  pointInRegion: function(x, y, rx, ry, rw, rh) {
    return x>rx && x<rx+rw && y>ry && y<ry+rh;
  },
  distance: function(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  }
};
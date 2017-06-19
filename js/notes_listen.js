var pentagram = {
  w: 500,
  h: 220,
  x: 80,
  y: 80,
  lines_n: 5,
  strokeW: 2,
  strokeC: 30,
  g: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/G-clef.svg/1000px-G-clef.svg.png"
};
pentagram.space_h = pentagram.h/(pentagram.lines_n-1);

var note_names = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
var note_freqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];

var utils = {};
utils.distBwPoints = function(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
};

buttons = [];
var Button = function(label, x, y, w, h, action) {
  this.label = label;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  buttons.push(this);
};
Button.prototype.draw = function() {
  strokeWeight(2);
  rect(this.x, this.y, this.w, this.h, 20);
  strokeWeight(0);
  textAlign(CENTER, CENTER)
  textSize(12);
  text(this.label, this.x + this.w/2, this.y + this.h/2);
};
Button.prototype.hovered = function() {
  return (this.x < mouseX && (this.x+this.w) > mouseX) && (this.y < mouseY && (this.y+this.h) > mouseY);
};

var notes = [];
var Note = function(x, y, letter, freq) {
  this.x = x;
  this.y = y;
  this.rad_x = 35;
  this.rad_y = 25;
  this.radmax_x = this.rad_x;
  this.radmax_y = this.rad_y;
  this.growth = 2;
  this.letter = letter;
  this.freq = freq;
  this.osc = new p5.Oscillator();
  this.osc.setType('sine');
  this.osc.freq(freq);
  this.osc.amp(0);
  this.osc.start();
  notes.push(this);
};
Note.prototype.growBack = function() {
  if (this.rad_x<this.radmax_x) {
    this.rad_x += this.growth;
  }
  else {
    this.rad_x = this.radmax_x;
  }
  if (this.rad_y<this.radmax_y) {
    this.rad_y += this.growth;
  }
  else {
    this.rad_y = this.radmax_y;
  }
};
Note.prototype.hovered = function() {
  return utils.distBwPoints(this.x, this.y, mouseX, mouseY) <= this.radmax_y/2
};
Note.prototype.click = function() {
  this.rad_x = this.rad_x/2;
  this.rad_y = this.rad_y/2;
  this.osc.amp(0.5, 0.05);
  var that = this;
  setTimeout(function() {that.osc.amp(0, 1);}, 200);
};
Note.prototype.showinfo = function() {
  // fill(0, 102, 153, 51);
  strokeWeight(0);
  textAlign(LEFT, CENTER)
  textSize(20);
  rect(this.x + 60 - 10, this.y - 10, 50,20)
  text(this.letter, this.x + 60, this.y);
};

function setup() {
  createCanvas(800, 480);
  pentagram.g = loadImage(pentagram.g);
  var pospos = pentagram.space_h/2*10
  var octave = 1;
  for (var i = 0; i < 12; i++) {
    if ((i+1)%8 == 0) {
      octave += 1;
    }
    new Note(pentagram.x+pentagram.w/2.5,
      pentagram.y+pospos-i*pentagram.space_h/2,
      note_names[(i+0)%(note_names.length)],
      note_freqs[(i+0)%(note_names.length)] * octave
    );
  }
  var buttx = pentagram.x+pentagram.w+40;
  var butty = pentagram.y;
  var buttw = 100;
  var butth = 30;
  var buttsep = butth+10
  new Button("Libre", buttx, butty, buttw, butth);
  new Button("Ejercitar", buttx, butty+buttsep, buttw, butth);
}

function draw() {
  clear();
  var i;
  for (i = 0; i < pentagram.lines_n; i++) {
    stroke(pentagram.strokeC);
    strokeWeight(pentagram.strokeW);
    line(pentagram.x, pentagram.y+i*pentagram.space_h, pentagram.x + pentagram.w, pentagram.y+i*pentagram.space_h);
  };
  line(pentagram.x + pentagram.w, pentagram.y, pentagram.x + pentagram.w, pentagram.y + pentagram.h);
  image(pentagram.g, pentagram.x+4, pentagram.y-15, pentagram.h/2, pentagram.h*1.2);
  for (i = 0; i < notes.length; i++) {
    // fill(255, 255, 255, 255);
    strokeWeight(pentagram.strokeW);
    ellipse(notes[i].x, notes[i].y, notes[i].rad_x, notes[i].rad_y);
    notes[i].growBack();
    if (notes[i].hovered()) {
      notes[i].showinfo();
    }
  }
  for (i = 0; i < buttons.length; i++) {
    buttons[i].draw();
  }
}

function mouseClicked() {
  for (var i = 0; i < notes.length; i++) {
    if (notes[i].hovered()) {
      notes[i].click();
    }
  };
}
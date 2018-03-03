// from here: https://stackoverflow.com/a/5932203
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;


function drawCircle(ctx, x, y, radius, color) {
    ctx.moveTo(x, y);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

function Particle(ctx, x, y) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hue = 0;
} 

Particle.prototype.RADIUS = 15;

Particle.prototype.draw = function() {
    var color = 'hsl(' + this.hue + ', 60%, 50%)';
    drawCircle(this.ctx, this.x, this.y, this.RADIUS, color);
}

Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.hue++;

    if (this.gravityParticle && !this.gravityParticle.hidden) {
        var xdistance = this.gravityParticle.x - this.x;
        var ydistance = this.gravityParticle.y - this.y;

        var euclideanDistance = Math.sqrt(xdistance * xdistance + ydistance * ydistance);
        this.vx += (xdistance / euclideanDistance) * this.gravityParticle.gravity;
        this.vy += (ydistance / euclideanDistance) * this.gravityParticle.gravity;
    } else {
        this.vy += this.gravity;
    }

    if (this.hue > 360) {
        this.hue = 0;
    }

    if ((this.x - this.RADIUS) < 0) {
        this.x = this.RADIUS + 1;
        this.vx *= -1;
    }
    else if ((this.x + this.RADIUS) >= ctx.canvas.width) {
        this.x = ctx.canvas.width - this.RADIUS - 1;
        this.vx *= -1;
    }
}

Particle.prototype.isInBounds = function(width, height) {
    return this.x >= 0 && this.y >= 0 && this.x < width && this.y < height;
}

function RandomParticle(ctx) {
    Particle.call(this, ctx, ctx.canvas.width / 2, ctx.canvas.height / 2);

    var yVariation = Math.random() * 5;

    this.vx = Math.random() * 6 - 3;
    this.vy = -Math.abs(this.vx) + yVariation - yVariation / 2;
}
RandomParticle.prototype = Object.create(Particle.prototype);
RandomParticle.prototype.gravity = 0.05;

function ActiveMouseParticle(ctx) {
    Particle.call(this, ctx, -1, -1);
    this.hidden = true;
}
ActiveMouseParticle.prototype = Object.create(Particle.prototype);
ActiveMouseParticle.prototype.gravity = 0.1;

ActiveMouseParticle.prototype.show = function() {
    this.hidden = false;
}

ActiveMouseParticle.prototype.hide = function() {
    this.hidden = true;
}

ActiveMouseParticle.prototype.draw = function() {
    if (!this.hidden) {
        var color = '#202020';
        drawCircle(this.ctx, this.x, this.y, 7, color);
    }
}

ActiveMouseParticle.prototype.update = function() {
}

var PARTICLE_COUNT = 100;

var canvas = document.getElementById('particle-canvas');
var ctx = canvas.getContext('2d');


var particles = [];
var gravtiyParticle = new ActiveMouseParticle(ctx, 0, 0);
particles.push(gravtiyParticle);


// create some particles
for (var i = 0; i < PARTICLE_COUNT; i++) {
    var p = new RandomParticle(ctx);
    p.gravtiyParticle = gravtiyParticle;
    particles.push(p);
}

// draw them constantly
setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    canvas.width = Math.floor($('#particle-canvas').width());
    canvas.height = Math.floor($('#particle-canvas').height());

    var newParticles = [];
    for (var p in particles) {
        particles[p].draw();
        particles[p].update();

        if (((particles[p] instanceof ActiveMouseParticle) ||
            particles[p].isInBounds(ctx.canvas.width, ctx.canvas.height)) &&
            newParticles.length < PARTICLE_COUNT + 1) {

            newParticles.push(particles[p]);
        }
    }

    while (newParticles.length < PARTICLE_COUNT + 1) {
        var p = new RandomParticle(ctx);
        p.gravityParticle = gravtiyParticle;
        newParticles.push(p);
    }
    particles = newParticles;

}, 10);

// listen for click events
$('#particle-canvas').on('mousedown', function(event) {
    gravtiyParticle.show();
});

$('#particle-canvas').on('mouseup', function(event) {
    gravtiyParticle.hide();
});

$('#particle-canvas').on('mousemove', function(event) {
    var coordinates = canvas.relMouseCoords(event);
    gravtiyParticle.x = coordinates.x;
    gravtiyParticle.y = coordinates.y;
});

$('.slider').on('input change', function(event) {
    var rightLabel = $(event.target.parentElement).find('.label-right');
    rightLabel.text(event.target.value);
});

$(".slider[name='radius']").on('change', function(event) {
    Particle.prototype.RADIUS = parseInt(event.target.value);
});

$(".slider[name='particle-count']").on('change', function(event) {
    PARTICLE_COUNT = parseInt(event.target.value);
});

$(".slider[name='environment-gravity']").on('change', function(event) {
    RandomParticle.prototype.gravity = parseFloat(event.target.value) / 100;
});

$(".slider[name='god-particle-gravity']").on('change', function(event) {
    ActiveMouseParticle.prototype.gravity = parseFloat(event.target.value) / 100;
});
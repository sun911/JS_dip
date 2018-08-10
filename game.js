'use strict'

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
    if(!(vector instanceof Vector)){
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(mult = 1) {
    return new Vector(this.x * mult, this.y * mult);
  }
}

/*
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/

class Actor{
  constructor(
    pos = new Vector(0, 0), 
    size = new Vector(1, 1), 
    speed = new Vector(0, 0)
    ){
    if(!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
      throw new Error('Неверный тип данных');
    } 
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() {}

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }
  
  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Можно передавать только объект типа Actor');
    }

    if (actor === this) {
      return false;
    }

    return this.right > actor.left && this.left < actor.right && this.bottom > actor.top && this.top < actor.bottom;
  }
}

/*const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/

class Level {
  constructor(grid = [], actors = []){
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.player = actors.find(el => el.type === 'player');
    this.height = grid.length;
    this.width = Math.max(0, ...grid.map(el => el.length));
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Необходимо передать объект типа Actor');
    }

    return this.actors.find(el => el.isIntersect(actor));
  }

  obstacleAt(position, size) {
    if (!(position instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Необходимо передать объект типа Vector');
    }

    const left = Math.floor(position.x),
    	top = Math.floor(position.y),
    	right = Math.ceil(position.x + size.x),
    	bottom = Math.ceil(position.y + size.y);

    if (left < 0 || right > this.width || top < 0) {
      return 'wall';
    }

    if (bottom > this.height) {
      return 'lava';
    }

    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {   
        if (this.grid[y][x]) {
          return this.grid[y][x];
        }
      }
    }
  }

  removeActor(actor) {
    const index = this.actors.findIndex(el => el === actor);
    if (index !== -1) {
      this.actors.splice(index, 1);
    }
  }

  noMoreActors(type) {
    return !this.actors.some(el => el.type === type);
  }

  playerTouched(type, actor = undefined) {
    if (this.status !== null) {
      return;
    }
    
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin' && actor.type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

/*
const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
*/

/*это не работает, требует класса Player
const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);
*/

class Player extends Actor {
  constructor(position = new Vector(0, 0)) {
    const pos = position.plus(new Vector(0, -0.5));
    const size = new Vector(0.8, 1.5);
    const speed = new Vector(0, 0);
    super(pos, size, speed);
  }

  get type() {
    return 'player';
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = Object.assign({}, dictionary);
  }

  actorFromSymbol(symbol) {
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    if (symbol === '!') {
      return 'lava';
    }
  }

  createGrid(plan) {
    return plan.reduce((memo, el) => {
      const line = el.split('').map(this.obstacleFromSymbol);
      memo.push(line);
      return memo;
    }, []);
  }

  createActors(plan) {
    const actors = [];
    for (let y = 0; y < plan.length; y++) {
      const line = plan[y].split('');
      for (let x = 0; x < line.length; x++) {
        const symbol = this.dictionary[line[x]];
        if (!(typeof symbol === 'function')){continue;} 
	  else{
	    const actor = new symbol(new Vector(x, y));
            if (actor instanceof Actor) {
              actors.push(actor);
          }
        }
      }
    }
    return actors;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

/*
const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));
*/

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    const size = new Vector(1, 1);
    super(pos, size, speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }

  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

  act(time, level) {
    const nextPos = this.getNextPosition(time);
    if (!(level.obstacleAt(nextPos, this.size))) {
      this.pos = nextPos;
    } else {
      this.handleObstacle();
    }
  }
}

/*
const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
*/

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed = new Vector(2, 0);
    super(pos, speed);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed = new Vector(0, 2);
    super(pos, speed);
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed = new Vector(0, 3);
    super(pos, speed);
    this.startPos = pos;
  }

  handleObstacle() {
    this.pos = this.startPos;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0)) {
    const pos = position.plus(new Vector(0.2, 0.1));
    const size = new Vector(0.6, 0.6);
    super(pos, size);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI;
    this.posBase = pos;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.posBase.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

const actorDict = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
};

const parser = new LevelParser(actorDict);

loadLevels()
  .then(schemas => runGame(JSON.parse(schemas), parser, DOMDisplay)
  .then(() => alert('Вы выиграли!')));
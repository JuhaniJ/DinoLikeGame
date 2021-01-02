let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 400,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 500 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

let frame;
let player;
let enemy;
let statics;
let mountains;
let start_text;
let score = 0;
let score_text;
let grass;

let cursors;

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('frame', 'images/frame.png');
    this.load.spritesheet('player', 'images/player_horse_sheet.png', { frameWidth: 325, frameHeight: 324 });
    this.load.image('cloud', 'images/cloud.png');
    this.load.image('mountains', 'images/mountains.png');
}

function create () {
  this.add.image(500, 200, 'frame').setScale(2);

  //Tile sprite for parallax
  mountains = this.add.tileSprite(500, 200, 0, 0, 'mountains').setScale(2,1);

  statics = this.physics.add.staticGroup();
  statics.create(0.5*config.width, 0.25*config.height, 'cloud');

  player = this.physics.add.sprite(40, 470, 'player').setScale(0.25);
  player.setCollideWorldBounds(true);
  player.setBounce(0.1);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 7, end: 0}),
      frameRate: 10,
      repeat: -1
  });

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'player', frame: 6 } ],
      frameRate: 20
  });

  this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
  });

  //this.physics.add.collider(player, )

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown)
  {
      player.setVelocityX(-160);

      player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
      player.setVelocityX(160);

      player.anims.play('right', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.blocked.down)
  {
      player.setVelocityY(-300);
  }
}

function collision_detection() {
  // add some buffer to make the solid collide
  var buffer_size = 5
  var enermy_right = parseInt(enermy.getBoundingClientRect().right);
  var enermy_left = parseInt(enermy.getBoundingClientRect().left);
  var enermy_top = parseInt(enermy.getBoundingClientRect().top);
  var player_right = parseInt(player.getBoundingClientRect().right);
  var player_left = parseInt(player.getBoundingClientRect().left);
  var player_bottom = parseInt(player.getBoundingClientRect().bottom);
  return (
    player_bottom >= enermy_top &&
    enermy_left <= player_right - buffer_size &&
    enermy_right >= player_left + buffer_size
  );
}

function enermy_passed_player() {
  return (parseInt(enermy.getBoundingClientRect().right) < parseInt(player.getBoundingClientRect().left));
}

function enermy_move() {
  enermy.classList.add("enermy_move")
}

function enermy_stop() {
  enermy.style.right = getComputedStyle(enermy).right
  enermy.classList.remove("enermy_move")
}

function enermy_reset() {
  enermy.style.right = "0px";
  if (enermy.classList.contains('enermy_move')) {
    enermy.classList.remove('enermy_move')
  }
}

function background_move() {
  cloud.style.right = -cloud.clientWidth + "px"
  cloud.classList.add('cloud_move')
  grass.style.right = -grass.clientWidth + "px"
  grass.classList.add('grass_move')
  mountains.style.left = "0";
  mountains.classList.add('mountains_move')
}

function background_stop() {
  cloud.style.right = getComputedStyle(cloud).right;
  cloud.classList.remove('cloud_move')
  grass.style.right = getComputedStyle(grass).right;
  grass.classList.remove('grass_move')
  mountains.style.left = getComputedStyle(mountains).left;
  mountains.classList.remove('mountains_move')
}

function add_score() {
  score++;
  score_display.innerHTML = "score : " + score;
}

function reset_score() {
  score = 0;
  score_display.innerHTML = "score : " + score;
}

function game_over() {
  start_game.style.display = "block";
  frame.removeEventListener("click", player_jump, true);
  enermy_stop()
  background_stop()
  player_stop_animation()
}

function game_start() {
  enermy_reset()
  reset_score()
  player_start_animation()
  start_game.style.display = 'none'
  frame.addEventListener('click', player_jump, true)

  enermy_move()
  background_move()

  score_added = false;

  game_update_interval = setInterval(game_update, game_update_rate)
  function game_update() {
    if (collision_detection()) {
      game_over()
      clearInterval(game_update_interval);
    } else {
      if (enermy_passed_player() && !score_added) { add_score(); score_added = true }
      if (!enermy_passed_player() && score_added) { score_added = false }
    }
  }
}

// game.js

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#e0f7fa',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
      extend: { resize: resize }
    }
};

let game = new Phaser.Game(config);

  let player, platforms, coins, flag, cursors, clouds, decorGroup;
  let movingPlatforms, movingHurdles, enemies;
let gameStarted = false;
  let startTime, coinCount = 0;
let startScreen, gameOverScreen, scoreText, timeText;
let mapIndex = 0;
  
const maps = [
    // 1. Simple Day
    {
        theme: 'day',
        backgroundColor: '#e0f7fa',
        clouds: [ [200,100], [600,80], [1200,150], [1800,60] ],
        hurdles: [
        { x: 4,  h: 3, step: true },
        { x: 10, h: 2, step: false },
        { x: 16, h: 4, step: true },
        { x: 22, h: 2, step: false },
        { x: 28, h: 3, step: true }
        ],
        coins: [ [4,5], [10,4], [16,5], [22,4], [28,5], [6,2], [18,2], [30,2] ],
        flagX: 36,
      movingPlatforms: [],      // horizontal movers only
      movingHurdles: [],
      enemies: []
    },
    // 2. Simple Night
    {
        theme: 'night',
        backgroundColor: '#0a1931',
        clouds: [ [300,120], [900,60], [1500,100] ],
        hurdles: [
        { x: 5,  h: 4, step: true },
        { x: 12, h: 2, step: false },
        { x: 18, h: 5, step: true },
        { x: 24, h: 3, step: true },
        { x: 30, h: 2, step: false },
        { x: 34, h: 5, step: true }
        ],
        coins: [ [5,6], [12,3], [18,6], [24,4], [30,3], [34,6], [8,2], [20,2], [32,2] ],
        flagX: 38,
        movingPlatforms: [
        // horizontal movers
        { x: 15*64+32, y: config.height-200, range: 200, speed: 1, direction: 'horizontal' },
        { x: 25*64+32, y: config.height-300, range: 150, speed: 1.5, direction: 'horizontal' }
        // vertical elevators added dynamically
      ],
      movingHurdles: [
        { x: 7*64+32,  y: config.height-96, range: 120, speed: 1.2, direction: 'horizontal' },
        { x: 20*64+32, y: config.height-96, range: 160, speed: 1.5, direction: 'horizontal' },
        { x: 36*64+32, y: config.height-96, range: 140, speed: 1.3, direction: 'horizontal' }
      ],
      enemies: []
    },
    // 3. Japanese Vibe
    {
        theme: 'japan',
        backgroundColor: '#ffe4ec',
        clouds: [ [200,100], [600,80], [1200,150] ],
        hurdles: [
        { x: 6,  h: 4, step: true },
        { x: 12, h: 3, step: true },
        { x: 18, h: 5, step: true },
        { x: 24, h: 2, step: false },
        { x: 30, h: 4, step: true },
        { x: 36, h: 3, step: true }
        ],
        coins: [ [6,5], [12,4], [18,6], [24,3], [30,5], [36,4], [8,2], [20,2], [32,2] ],
        flagX: 44,
        movingPlatforms: [
        { x: 20*64+32, y: config.height-250, range: 180, speed: 1.2, direction: 'horizontal' },
        { x: 32*64+32, y: config.height-350, range: 120, speed: 1.5, direction: 'vertical' }
      ],
      movingHurdles: [
        { x: 8*64+32,  y: config.height-96, range: 130, speed: 1.3, direction: 'horizontal' },
        { x: 20*64+32, y: config.height-96, range: 150, speed: 1.4, direction: 'horizontal' },
        { x: 32*64+32, y: config.height-96, range: 140, speed: 1.3, direction: 'horizontal' }
        ],
        enemies: [
        { x: 16*64+32, y: config.height-96, range: 120, speed: 1.2 }
      ]
    },
    // 4. Desert Vibe
    {
        theme: 'desert',
        backgroundColor: '#ffe082',
        clouds: [ [400,120], [1000,60] ],
        hurdles: [
        { x: 8,  h: 3, step: true },
        { x: 14, h: 2, step: false },
        { x: 20, h: 5, step: true },
        { x: 26, h: 4, step: true },
        { x: 32, h: 2, step: false },
        { x: 38, h: 6, step: true }
        ],
        coins: [ [8,4], [14,3], [20,6], [26,5], [32,3], [38,7], [10,2], [22,2], [34,2] ],
        flagX: 50,
        movingPlatforms: [
        { x: 22*64+32, y: config.height-200, range: 220, speed: 1.3, direction: 'horizontal' },
        { x: 40*64+32, y: config.height-300, range: 100, speed: 1.7, direction: 'vertical' }
      ],
      movingHurdles: [
        { x: 22*64+32, y: config.height-96, range: 160, speed: 1.6, direction: 'horizontal' },
        { x: 40*64+32, y: config.height-96, range: 180, speed: 1.8, direction: 'horizontal' }
        ],
        enemies: [
        { x: 28*64+32, y: config.height-96, range: 180, speed: 1.5 }
        ]
    },
    // 5. Hi-Rise Vibe
    {
        theme: 'city',
        backgroundColor: '#b3e5fc',
        clouds: [ [300,100], [900,80], [1500,120] ],
        hurdles: [
        { x: 10, h: 5, step: true },
        { x: 16, h: 3, step: true },
        { x: 22, h: 6, step: true },
        { x: 28, h: 4, step: true },
        { x: 34, h: 2, step: false },
        { x: 40, h: 7, step: true }
        ],
        coins: [ [10,6], [16,4], [22,7], [28,5], [34,3], [40,8], [12,2], [24,2], [36,2] ],
        flagX: 56,
        movingPlatforms: [
        { x: 26*64+32, y: config.height-250, range: 200, speed: 1.5, direction: 'horizontal' },
        { x: 44*64+32, y: config.height-350, range: 150, speed: 1.8, direction: 'vertical' }
      ],
      movingHurdles: [
        { x: 12*64+32, y: config.height-96, range: 170, speed: 1.7, direction: 'horizontal' },
        { x: 24*64+32, y: config.height-96, range: 190, speed: 1.9, direction: 'horizontal' },
        { x: 42*64+32, y: config.height-96, range: 200, speed: 2.0, direction: 'horizontal' }
        ],
        enemies: [
        { x: 30*64+32, y: config.height-96, range: 200, speed: 1.7 }
        ]
    }
];

function preload() {
    // decor
    [
      'pagoda','torii','blossom','lantern','cactus','sand_dune','sun','palm','skyline','building','star','cloud',
      'apple','banyan','icecream','night_building','pine'
    ].forEach(n => this.load.image(n, `assets/decor/${n}.png`));
    // blocks
    ['day_block','night_block','japan_block','desert_block','city_block']
      .forEach(n => this.load.image(n, `assets/blocks/${n}.png`));
    // hurdles
    ['day_horiz','night_horiz','japan_horiz','desert_horiz','city_horiz']
      .forEach(n => this.load.image(n, `assets/hurdles/${n}.png`));
    // cloud sprite
    this.load.image('cloud','assets/decor/cloud.png');
    // villains
    for(let i=1; i<=5; i++){
      this.load.image(`villain${i}`, `assets/villains/villain${i}.png`);
    }
}

function create() {
    gameStarted = false;
    this.scale.on('resize', resize, this);
    clouds     = this.add.group();
    decorGroup = this.add.group();
    addDecorForMap(this, mapIndex);
  
    // start screen
    const map = maps[mapIndex];
    console.log('Creating map:', mapIndex + 1, 'Theme:', map.theme); // Debug log
    
    showStartScreen(this, mapIndex);
}

function startGame(scene) {
    gameStarted = true;
    startScreen.setVisible(false);
    if(gameOverScreen) gameOverScreen.destroy();
    gameOverScreen = null;
    startTime = Date.now();
    coinCount = 0;

    const map = maps[mapIndex];
    scene.cameras.main.setBackgroundColor(map.backgroundColor);

    // world bounds
    const worldWidth = 64*60;
    scene.physics.world.setBounds(0,0,worldWidth,config.height);
  
    // ground
    platforms = scene.physics.add.staticGroup();
    let gk = map.theme==='night'?'night_block':
             map.theme==='japan'?'japan_block':
             map.theme==='desert'?'desert_block':
             map.theme==='city'?'city_block':'day_block';
    for(let i=0;i<60;i++){
      let g = scene.add.image(i*64+32,config.height-32,gk).setDisplaySize(64,64);
      platforms.add(g);
    }
  
    // hurdles + left‐side elevators
    movingPlatforms = scene.physics.add.group({ allowGravity:false, immovable:true });
    map.hurdles.forEach(h => {
      // static stack
      createBlockStack(scene, h.x, 6, h.h, h.step);
  
      // dynamic left elevator if tall
      if(h.h > 3){
        const tileX = h.x*64+32;
        const elevX = tileX - 64;
        const topY   = config.height - 32 - h.h*64 + 12;
        const botY   = config.height - 32 - 12;
        const midY   = (topY + botY)/2;
        const range  = (botY - topY)/2;
        let elev = scene.add.rectangle(elevX, midY, 96, 24, 0x90caf9).setStrokeStyle(2,0x1976d2);
        scene.physics.add.existing(elev, false);
        elev.body.setAllowGravity(false).setImmovable(true);
        elev.startY    = midY;
        elev.range     = range;
        elev.speed     = 1.2;
        elev.direction = 'vertical';
        elev.moveTimer = 0;
        movingPlatforms.add(elev);
      }
    });
  
    // player as ball
    const col = map.theme==='night'? 0xeeeeee : 0x222222;
    player = scene.add.circle(64, config.height-96, 24, col);
    scene.physics.add.existing(player);
    player.body.setCircle(24).setBounce(0.1).setCollideWorldBounds(true)
          .setBoundsRectangle(new Phaser.Geom.Rectangle(0,0,worldWidth,config.height));

    // coins
    coins = scene.physics.add.group();
    map.coins.forEach(c => createCoin(scene, c[0], c[1]));

    // flag
    flag = scene.add.rectangle(map.flagX*64+32, config.height-128, 12,128,0x333);
    scene.physics.add.existing(flag,true);
    scene.add.triangle(map.flagX*64+38,config.height-192,0,0,0,40,40,20,0xff4444).setOrigin(0,0.5);
  
    // colliders
    scene.physics.add.collider(player, platforms);
    scene.physics.add.collider(player, movingPlatforms);
    scene.physics.add.collider(coins, platforms);
    scene.physics.add.overlap(player, coins, collectCoin, null, scene);

    // controls & UI
    cursors = scene.input.keyboard.createCursorKeys();
    scoreText = scene.add.text(32,32,'Coins: 0',{ fontSize:'32px', fill: map.theme==='night'? '#fff':'#333' });
    timeText  = scene.add.text(32,72,'Time: 0s',{ fontSize:'32px', fill: map.theme==='night'? '#fff':'#333' });
  
    // camera
    scene.cameras.main
      .setBounds(0,0,worldWidth,config.height)
      .startFollow(player,true,0.08,0.08)
      .setDeadzone(config.width/2,config.height/2);
  
    // clouds + stars
    clouds.clear(true,true);
    map.clouds.forEach(c => createCloud(scene, c[0], c[1], map.theme));
    if(map.theme==='night'){
      for(let i=0;i<40;i++){
        let star = scene.add.circle(Math.random()*worldWidth,Math.random()*200+40,2,0xffffff,0.8);
            clouds.add(star);
        }
    }
}

function update() {
    if(!gameStarted) return;
    let t = Math.floor((Date.now()-startTime)/1000);
    timeText.setText(`Time: ${t}s`);
    // player movement
    if(cursors.left.isDown)      player.body.setVelocityX(-260);
    else if(cursors.right.isDown) player.body.setVelocityX(260);
    else                            player.body.setVelocityX(0);
    if((cursors.up.isDown||cursors.space.isDown) && player.body.blocked.down){
      player.body.setVelocityY(-600);
    }
    // finish - check if player has passed or touched the flag
    if(!gameOverScreen && player.x + player.displayWidth/2 >= flag.x - (flag.width||flag.displayWidth||6)/2){
      showScoreScreen(this, t);
    }
    // animate movers
    movingPlatforms.children.iterate(p => {
      if(!p) return;
      p.moveTimer += p.speed;
      if(p.direction==='horizontal'){
        p.x = p.startX + Math.sin(p.moveTimer*0.01)*p.range;
      } else {
        p.y = p.startY + Math.sin(p.moveTimer*0.01)*p.range;
      }
      p.body.updateFromGameObject();
    });
}

function collectCoin(player, coin) {
    coin.body.enable = false;
    coin.setVisible(false);
    coin.setActive(false);
    coinCount++;
    scoreText.setText(`Coins: ${coinCount}`);
}

function showScoreScreen(scene, totalTime) {
    // Pause the game
    scene.physics.pause();
    if (gameOverScreen) gameOverScreen.destroy();
    const cam = scene.cameras.main;
    gameOverScreen = scene.add.container(cam.scrollX + cam.width/2, cam.scrollY + cam.height/2);
    const theme = [
        { card: 0xffffff, accent: '#1976d2', text: '#222', btn: '#1976d2', btnText: '#fff' }, // day
        { card: 0x222233, accent: '#90caf9', text: '#fff', btn: '#90caf9', btnText: '#222' }, // night
        { card: 0xffe4ec, accent: '#d81b60', text: '#222', btn: '#d81b60', btnText: '#fff' }, // japan
        { card: 0xfff8e1, accent: '#fbc02d', text: '#222', btn: '#fbc02d', btnText: '#222' }, // desert
        { card: 0xb3e5fc, accent: '#0288d1', text: '#222', btn: '#0288d1', btnText: '#fff' }  // city
    ][mapIndex];

    // Blur overlay (simulated)
    let blur = scene.add.rectangle(0, 0, config.width * 2, config.height * 2, 0xffffff, 0.45).setOrigin(0.5);
    gameOverScreen.add(blur);

    // Simulated shadow (optional)
    let shadow = scene.add.rectangle(8, 16, 528, 384, 0x000000, 0.18).setOrigin(0.5);
    gameOverScreen.add(shadow);

    // Card background with border (20% larger)
    let card = scene.add.rectangle(0, 0, 504, 384, theme.card, 0.97)
        .setOrigin(0.5)
        .setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(theme.accent).color)
        .setDepth(1001)
        .setAlpha(0.98);
    gameOverScreen.add(card);

    // Title
    let title = scene.add.text(0, -120, 'Level Complete!', {
        fontFamily: 'monospace', fontSize: '48px', fontStyle: 'bold', color: theme.text,
        align: 'center', stroke: theme.accent, strokeThickness: 2, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5);
    gameOverScreen.add(title);

    // Time
    let timer = scene.add.text(0, -40, `Time: ${totalTime}s`, {
        fontFamily: 'monospace', fontSize: '32px', color: theme.text, align: 'center'
    }).setOrigin(0.5);
    gameOverScreen.add(timer);

    // Coins
    let coins = scene.add.text(0, 20, `Coins: ${coinCount}`, {
        fontFamily: 'monospace', fontSize: '32px', color: theme.text, align: 'center'
    }).setOrigin(0.5);
    gameOverScreen.add(coins);

    // Themed Next Level button
    const isLastLevel = mapIndex >= maps.length - 1;
    const nextText = isLastLevel ? 'Restart' : 'Next Level ▶';
    let next = scene.add.text(0, 90, nextText, {
        fontFamily: 'monospace', fontSize: '32px', color: theme.btnText, backgroundColor: theme.btn,
        padding: { left: 32, right: 32, top: 12, bottom: 12 }, borderRadius: 16
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor:true })
    .on('pointerdown', () => {
        mapIndex = isLastLevel ? 0 : mapIndex + 1;
        scene.scene.restart();
    })
    .on('pointerover', function() { this.setStyle({ backgroundColor: theme.accent }); })
    .on('pointerout', function() { this.setStyle({ backgroundColor: theme.btn }); });
    gameOverScreen.add(next);

    // Themed Restart button
    let restart = scene.add.text(0, 150, 'Restart Map', {
        fontFamily: 'monospace', fontSize: '28px', color: theme.btnText, backgroundColor: theme.accent,
        padding: { left: 28, right: 28, top: 10, bottom: 10 }, borderRadius: 12
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor:true })
    .on('pointerdown', () => {
        scene.scene.restart();
    })
    .on('pointerover', function() { this.setStyle({ backgroundColor: theme.btn }); })
    .on('pointerout', function() { this.setStyle({ backgroundColor: theme.accent }); });
    gameOverScreen.add(restart);

    // Optional: add a small accent decor (e.g., a circle or icon)
    let accent = scene.add.circle(-180, -150, 22, Phaser.Display.Color.HexStringToColor(theme.accent).color, 0.18).setDepth(1002);
    gameOverScreen.add(accent);

    gameOverScreen.setDepth(1001);
}
  
  function createBlockStack(scene, x, y, height, addStep=false) {
    const map     = maps[mapIndex];
    const groundY = config.height - 32;
    let blk = map.theme==='night'?'night_block':
              map.theme==='japan'?'japan_block':
              map.theme==='desert'?'desert_block':
              map.theme==='city'?'city_block':'day_block';
    for(let i=0;i<height;i++){
      let b = scene.add.image(x*64+32, groundY - i*64 -32, blk).setDisplaySize(64,64);
      platforms.add(b);
    }
    if(addStep && height>=3){
      let s = scene.add.image((x-1)*64+32, groundY - (height-2)*64 -32, blk).setDisplaySize(64,64);
      platforms.add(s);
    }
  }
  
function createCoin(scene, x, y) {
    let cy = config.height - 32 - y*64 - 18;
    let c  = scene.add.circle(x*64+32, cy, 18, 0xffd600).setStrokeStyle(2,0xffa000);
    scene.physics.add.existing(c);
    c.body.setCircle(18).setBounce(0.4);
    coins.add(c);
  }
  
function createCloud(scene, x, y, theme) {
    let scale = theme==='night' ? 0.68 : 0.85; // previous values
    scale *= 0.9; // reduce by 10%
    let cloud = scene.add.image(x, y, 'cloud')
        .setScale(scale)
        .setAlpha(theme==='night'?0.6:0.8);
    clouds.add(cloud);
    scene.tweens.add({
        targets: cloud,
        x: x + 40 + Math.random()*60,
        duration: 12000 + Math.random()*4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
  }
  
function resize(gameSize) {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
  }
  
  function addDecorForMap(scene, mapIndex) {
    const groundY = config.height - 32 + 20 + config.height * 0.05; // nudge further down by 5%
    const normalH = config.height * 0.5 * 1.15;
    const bigH = config.height * 0.6 * 1.15;
    let gap = 277; // default gap
    let decorList = [];
    let sizes = [];
    let yOffsets = [];
    switch(mapIndex) {
        case 0: // Day
            decorList = ['apple','banyan','icecream'];
            sizes = [normalH, bigH, normalH];
            yOffsets = [0, 0, 0];
            break;
        case 1: // Night
            decorList = ['pine','night_building','pine'];
            sizes = [normalH, bigH, normalH];
            yOffsets = [0, 0, 0];
            break;
        case 2: // Japan
            gap = Math.round(gap * 1.2); // 20% more spacing
            decorList = ['pagoda','lantern','torii'];
            sizes = [bigH * 1.25, normalH * 0.85, normalH];
            yOffsets = [0, 0, 0];
            break;
        case 3: // Desert
            decorList = ['cactus','sand_dune','palm','sand_dune'];
            sizes = [normalH, normalH, bigH, normalH];
            yOffsets = [0, config.height * 0.25, 0, config.height * 0.25]; // sand_dune 25% lower
            break;
        case 4: // City
            decorList = ['building','skyline','building','skyline','building'];
            sizes = [normalH * 1.3, bigH * 1.2, normalH * 1.3, bigH * 1.2, normalH * 1.3 * 0.9]; // building 30% bigger, last building 10% smaller
            yOffsets = [0, config.height * 0.25, 0, config.height * 0.25, 0]; // skyline 25% lower
            break;
        default:
            return;
    }
    let x = 0;
    for(let i=0; i<decorList.length; i++) {
        let key = decorList[i];
        let h = sizes[i];
        let y = groundY + (yOffsets[i] || 0);
        let img = scene.add.image(x, y, key).setOrigin(0,1).setDisplaySize(h, h).setDepth(-10);
        decorGroup.add(img);
        x += h + gap;
    }
  }
  
function showStartScreen(scene, mapIndex) {
    // Remove any previous start screen
    if (startScreen) startScreen.destroy();
    startScreen = scene.add.container(config.width/2, config.height/2);

    // Theme data
    const themes = [
        {
            color: '#e0f7fa', overlay: 0xffffff, overlayAlpha: 0.7,
            title: 'Sunlit Beginnings', tagline: 'Awaken the world, one leap at a time.',
            btnColor: '#1976d2', btnText: 'Start', effect: 'grass'
        },
        {
            color: '#0a1931', overlay: 0x222233, overlayAlpha: 0.7,
            title: 'Midnight Traverse', tagline: 'Shadows move. So must you.',
            btnColor: '#90caf9', btnText: 'Begin', effect: 'smoke'
        },
        {
            color: '#ffe4ec', overlay: 0xffe4ec, overlayAlpha: 0.7,
            title: 'Sakura Ascent', tagline: 'Grace and challenge beneath the blossoms.',
            btnColor: '#d81b60', btnText: 'Ascend', effect: 'petals'
        },
        {
            color: '#ffe082', overlay: 0xfff8e1, overlayAlpha: 0.7,
            title: 'Dune Crossing', tagline: 'Endure the heat. Find the path.',
            btnColor: '#fbc02d', btnText: 'Venture', effect: 'sand'
        },
        {
            color: '#b3e5fc', overlay: 0xb3e5fc, overlayAlpha: 0.7,
            title: 'Skyline Sprint', tagline: 'Above the noise, the city calls.',
            btnColor: '#0288d1', btnText: 'Sprint', effect: 'wind'
        }
    ];
    const theme = themes[mapIndex];

    // Blurred overlay (simulated)
    let bg = scene.add.rectangle(0, 0, config.width, config.height, theme.overlay, theme.overlayAlpha).setOrigin(0.5);
    startScreen.add(bg);

    // Animated effect
    if (theme.effect === 'grass') {
        // Flowing grass
        for (let i = 0; i < 8; i++) {
            let grass = scene.add.rectangle(-config.width/2 + i*160, config.height/2-40, 120, 18, 0x43a047, 0.7).setOrigin(0,1);
            scene.tweens.add({ targets: grass, x: grass.x + 40, duration: 3000 + i*200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            startScreen.add(grass);
        }
    } else if (theme.effect === 'smoke') {
        // Drifting smoke
        for (let i = 0; i < 6; i++) {
            let smoke = scene.add.ellipse(-config.width/3 + i*180, -config.height/4 + i*10, 90, 40, 0xffffff, 0.18).setOrigin(0.5);
            scene.tweens.add({ targets: smoke, x: "+=60", duration: 4000 + i*300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            startScreen.add(smoke);
        }
    } else if (theme.effect === 'petals') {
        // Falling sakura petals
        for (let i = 0; i < 12; i++) {
            let petal = scene.add.ellipse(-config.width/2 + Math.random()*config.width, -config.height/2 + Math.random()*80, 18, 10, 0xf06292, 0.5).setOrigin(0.5);
            scene.tweens.add({ targets: petal, y: "+=180", x: "+=40", duration: 4000 + Math.random()*2000, repeat: -1, yoyo: false, ease: 'Sine.easeIn' });
            startScreen.add(petal);
        }
    } else if (theme.effect === 'sand') {
        // Blowing sand
        for (let i = 0; i < 10; i++) {
            let sand = scene.add.ellipse(-config.width/2 + Math.random()*config.width, config.height/2-60-Math.random()*80, 40, 12, 0xffe082, 0.25).setOrigin(0.5);
            scene.tweens.add({ targets: sand, x: sand.x + 80, duration: 3500 + i*150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            startScreen.add(sand);
        }
    } else if (theme.effect === 'wind') {
        // Blowing wind
        for (let i = 0; i < 8; i++) {
            let wind = scene.add.rectangle(-config.width/2 + i*180, -config.height/4 + i*10, 120, 8, 0x81d4fa, 0.18).setOrigin(0,0.5);
            scene.tweens.add({ targets: wind, x: wind.x + 60, duration: 3000 + i*200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            startScreen.add(wind);
        }
    }

    // Main game title for first map
    if (mapIndex === 0) {
        let gameTitle = scene.add.text(0, -180, 'Mr. Ball', {
            fontFamily: 'monospace', fontSize: '72px', fontStyle: 'bold', color: '#1976d2', align: 'center',
            stroke: '#fff', strokeThickness: 8, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 6, fill: true }
        }).setOrigin(0.5);
        startScreen.add(gameTitle);
    }

    // Title
    let title = scene.add.text(0, -80, theme.title, {
        fontFamily: 'monospace', fontSize: '56px', fontStyle: 'bold', color: '#222', align: 'center', backgroundColor: '',
        stroke: '#fff', strokeThickness: 6, shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    }).setOrigin(0.5);
    startScreen.add(title);

    // Tagline
    let tagline = scene.add.text(0, 0, theme.tagline, {
        fontFamily: 'monospace', fontSize: '28px', color: '#444', align: 'center', wordWrap: { width: 600 }
    }).setOrigin(0.5);
    startScreen.add(tagline);

    // Themed start button
    let btn = scene.add.text(0, 90, theme.btnText, {
        fontFamily: 'monospace', fontSize: '40px', color: '#fff', backgroundColor: theme.btnColor,
        padding: { left: 32, right: 32, top: 12, bottom: 12 }, borderRadius: 16
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => { if (!gameStarted) startGame(scene); });
    startScreen.add(btn);
    startScreen.setDepth(1000);
}
  
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function drawBuilding(scene, building, selected, onSelect) {
  const x = scene.scale.width * building.x;
  const y = scene.scale.height * building.y;
  const group = scene.add.container(x, y).setSize(142, 110).setDepth(y).setInteractive({ useHandCursor: true });
  const shadow = scene.add.ellipse(0, 22, 128, 34, 0x201a1b, 0.55);
  group.add(shadow);
  const trim = selected ? 0xffbd8a : 0x5a4640;
  if (building.kind === 'habitat' || building.kind === 'shelter') {
    const shell = building.kind === 'habitat' ? 0xd5d1c6 : 0x98816e;
    group.add(scene.add.ellipse(0, -4, 85, 64, shell).setStrokeStyle(2, trim));
    group.add(scene.add.rectangle(0, 14, 84, 20, 0x8a8b87).setStrokeStyle(2, 0x635e58));
    group.add(scene.add.ellipse(0, -19, 85, 25, 0xe5ded0).setStrokeStyle(2, trim));
    group.add(scene.add.rectangle(1, 4, 16, 34, 0x394751).setStrokeStyle(2, 0xaaa18e));
    group.add(scene.add.rectangle(-26, -3, 14, 10, 0x7da4b0).setStrokeStyle(1, 0x283139));
    group.add(scene.add.circle(-28, -8, 2, 0xc5e7e5));
  } else if (building.kind === 'solar') {
    group.add(scene.add.line(-4, 3, 0, 15, 4, 35, 0xb6a68f).setLineWidth(5));
    group.add(scene.add.rectangle(0, -4, 91, 31, 0x1d384c).setAngle(-13).setStrokeStyle(3, 0xb8ced1));
    for (let i = -3; i <= 3; i += 1) group.add(scene.add.line(i * 12, -19, i * 12, -19, i * 12, 12, 0x73a9b5).setLineWidth(1));
    group.add(scene.add.line(-45, -4, -45, -4, 45, -4, 0x9eb5c1).setLineWidth(1));
  } else if (building.kind === 'greenhouse') {
    group.add(scene.add.ellipse(0, -5, 82, 58, 0x50756d).setStrokeStyle(3, trim));
    group.add(scene.add.ellipse(0, -20, 82, 24, 0xa6c5bc, 0.8).setStrokeStyle(2, 0xd1e2d9));
    for (let i = -2; i <= 2; i += 1) group.add(scene.add.line(i * 13, -17, i * 13, -17, i * 13, 11, 0xafd08e).setLineWidth(3));
  } else if (building.kind === 'lifeSupport') {
    group.add(scene.add.ellipse(0, 0, 67, 50, 0x737d80).setStrokeStyle(3, trim));
    group.add(scene.add.circle(-19, -3, 12, 0x9ab6b8).setStrokeStyle(2, 0x404c51));
    group.add(scene.add.circle(18, -3, 12, 0x6b999b).setStrokeStyle(2, 0x404c51));
    group.add(scene.add.rectangle(0, -26, 26, 8, 0xd2c4ae).setStrokeStyle(2, 0x4c4b48));
  } else {
    group.add(scene.add.ellipse(0, 3, 65, 28, 0x716b62));
    group.add(scene.add.rectangle(0, -11, 47, 19, 0xaaa18c).setStrokeStyle(2, 0x45423e));
    group.add(scene.add.circle(18, -20, 8, 0x7798a4));
    group.add(scene.add.circle(-18, 17, 8, 0x29292b)); group.add(scene.add.circle(18, 17, 8, 0x29292b));
  }
  group.add(scene.add.text(0, 43, building.name.toUpperCase(), { fontFamily: 'Aptos, Arial, sans-serif', fontSize: '10px', color: '#fff0e2', fontStyle: 'bold', stroke: '#291c1b', strokeThickness: 4 }).setOrigin(.5));
  group.add(scene.add.text(0, 57, building.status === 'online' ? 'ONLINE' : 'STANDBY', { fontFamily: 'Aptos, Arial, sans-serif', fontSize: '8px', color: building.status === 'online' ? '#b6e6b0' : '#ffd49c', stroke: '#291c1b', strokeThickness: 3 }).setOrigin(.5));
  group.on('pointerover', () => group.setScale(1.04));
  group.on('pointerout', () => group.setScale(1));
  group.on('pointerdown', onSelect);
}

export default function OutpostScene({ snapshot, selectedBuildingId, onSelectBuilding, view = 'third' }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const latestRef = useRef({ snapshot, selectedBuildingId, onSelectBuilding, view });
  latestRef.current = { snapshot, selectedBuildingId, onSelectBuilding, view };

  useEffect(() => {
    if (!hostRef.current) return undefined;
    class MarsOutpost extends Phaser.Scene {
      constructor() { super('MarsOutpost'); this.walkerX = 0.48; this.walkerY = 0.84; this.target = null; this.jumpStartedAt = null; }
      preload() { this.load.image('mars-rover-reference', 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA21723.jpg'); }
      create() {
        sceneRef.current = this;
        this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE');
        this.input.on('pointerdown', (pointer) => {
          const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
          this.target = { x: Phaser.Math.Clamp(point.x / this.scale.width, .08, .92), y: Phaser.Math.Clamp(point.y / this.scale.height, .68, .93) };
          if (this.moveMarker) this.moveMarker.setPosition(this.target.x * this.scale.width, this.target.y * this.scale.height).setVisible(true);
        });
        this.paint();
        this.scale.on('resize', () => this.paint());
      }
      paint() {
        const { width, height } = this.scale;
        this.children.removeAll(true);
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x111a29, 0x252435, 0x9d5d4c, 0x6c413e, 1); bg.fillRect(0, 0, width, height).setDepth(-3);
        if (this.textures.exists('mars-rover-reference')) this.add.image(width*.5, height*.44, 'mars-rover-reference').setDisplaySize(height*6.6, height*.88).setAlpha(.42).setDepth(-2);
        this.add.circle(width * .78, height * .2, Math.min(48, width * .06), 0xe9ad7a, .86);
        this.add.circle(width * .78, height * .2, Math.min(67, width * .085), 0xe8a777, .1);
        for (let i = 0; i < 64; i += 1) {
          const sx = (i * 139 + 21) % width; const sy = (i * 73 + 13) % (height * .49);
          this.add.circle(sx, sy, i % 7 === 0 ? 1.5 : .8, 0xffecd9, .35 + (i % 3) * .12);
        }
        const far = this.add.graphics(); far.fillStyle(0x774a47, 1); far.fillPoints([
          {x:0,y:height*.48},{x:width*.16,y:height*.39},{x:width*.3,y:height*.48},{x:width*.48,y:height*.35},{x:width*.66,y:height*.48},{x:width*.83,y:height*.37},{x:width,y:height*.45},{x:width,y:height},{x:0,y:height}
        ], true);
        const terrain = this.add.graphics();
        terrain.fillGradientStyle(0x975d4b, 0x8e594a, 0x613b38, 0x392f35, 1); terrain.fillPoints([
          {x:0,y:height*.64},{x:width*.16,y:height*.58},{x:width*.31,y:height*.66},{x:width*.52,y:height*.55},{x:width*.74,y:height*.64},{x:width,y:height*.57},{x:width,y:height},{x:0,y:height}
        ], true);
        terrain.lineStyle(1, 0xd08a69, .24);
        for (let i = 0; i < 8; i += 1) terrain.strokeEllipse(width*.51, height*(.68 + i*.05), width*(.32 + i*.11), height*(.05 + i*.02));
        for (let i = 0; i < 75; i += 1) {
          const x = (i * 137) % width; const y = height * .65 + ((i * 43) % Math.max(height * .34, 1));
          this.add.ellipse(x, y, 2 + i % 5, 1 + i % 2, i % 2 ? 0x563e3c : 0xd1916d, .45).setDepth(y);
        }
        // A raised, dusty service path links the habitat to the field equipment.
        const path = this.add.graphics().setDepth(height * .7);
        path.fillStyle(0xc48c6f, .34); path.beginPath(); path.moveTo(width*.48,height*.72); path.lineTo(width*.38,height); path.lineTo(width*.62,height); path.lineTo(width*.55,height*.72); path.closePath(); path.fillPath();
        path.lineStyle(2, 0xf2c49b, .35); path.beginPath(); path.moveTo(width*.49,height*.74); path.lineTo(width*.45,height); path.strokePath();
        const state = latestRef.current;
        state.snapshot.buildings.forEach((building) => drawBuilding(this, building, building.id === state.selectedBuildingId, () => state.onSelectBuilding(building.id)));
        this.moveMarker = this.add.circle(this.walkerX * width, this.walkerY * height, 11, 0xffd09e, .16).setStrokeStyle(2, 0xffd09e, .8).setDepth(height * .99).setVisible(false);
        this.walker = this.add.container(this.walkerX * width, this.walkerY * height).setDepth(this.walkerY * height + 2);
        this.walker.add(this.add.ellipse(0, 18, 27, 9, 0x1b1a20, .55));
        this.walker.add(this.add.ellipse(0, 0, 18, 20, 0xd9d4c9).setStrokeStyle(2, 0x69737b));
        this.walker.add(this.add.circle(0, -11, 10, 0xbec5c6).setStrokeStyle(2, 0x66737b));
        this.walker.add(this.add.arc(0, -11, 7, 200, 340, false, 0x6c8f9b, 1).setStrokeStyle(1, 0xe8dbba));
        this.walkerLegLeft = this.add.rectangle(-5, 10, 4, 13, 0xb6b1a5).setOrigin(.5, 0);
        this.walkerLegRight = this.add.rectangle(5, 10, 4, 13, 0xb6b1a5).setOrigin(.5, 0);
        this.walker.add(this.walkerLegLeft); this.walker.add(this.walkerLegRight);
        this.walker.add(this.add.rectangle(-11, 0, 4, 12, 0xd9d4c9)); this.walker.add(this.add.rectangle(11, 0, 4, 12, 0xd9d4c9));
        this.walker.setScale(.85 + this.walkerY * .35);
        this.applyView(state.view);
      }
      applyView(mode) {
        if (!this.cameras?.main) return;
        const zoom = mode === 'first' ? 1.52 : mode === 'second' ? 1.13 : 1;
        this.cameras.main.setZoom(zoom);
        if (this.walker) this.walker.setVisible(mode !== 'first');
        if (mode === 'first') this.cameras.main.centerOn(this.walkerX * this.scale.width, this.walkerY * this.scale.height - 45);
        else if (mode === 'second') this.cameras.main.centerOn(this.walkerX * this.scale.width + 85, this.walkerY * this.scale.height - 32);
        else this.cameras.main.centerOn(this.walkerX * this.scale.width, this.walkerY * this.scale.height - 70);
      }
      update(_time, delta) {
        if (!this.walker || !this.keys) return;
        const step = Math.min(delta / 1000, .05) * .19;
        let dx = 0; let dy = 0;
        if (this.keys.A.isDown || this.keys.LEFT.isDown) dx -= step;
        if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx += step;
        if (this.keys.W.isDown || this.keys.UP.isDown) dy -= step;
        if (this.keys.S.isDown || this.keys.DOWN.isDown) dy += step;
        if (dx || dy) { this.target = null; this.walkerX += dx; this.walkerY += dy; }
        else if (this.target) {
          const vx = this.target.x - this.walkerX; const vy = this.target.y - this.walkerY;
          const distance = Math.hypot(vx, vy);
          if (distance < .01) { this.target = null; this.moveMarker?.setVisible(false); }
          else { this.walkerX += vx / distance * step; this.walkerY += vy / distance * step; }
        }
        this.walkerX = Phaser.Math.Clamp(this.walkerX, .06, .94);
        this.walkerY = Phaser.Math.Clamp(this.walkerY, .66, .96);
        const walking = Boolean(dx || dy || this.target);
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && this.jumpStartedAt === null) this.jumpStartedAt = _time;
        let hopHeight = 0;
        if (this.jumpStartedAt !== null) {
          const hopProgress = (_time - this.jumpStartedAt) / 920;
          if (hopProgress >= 1) this.jumpStartedAt = null;
          else hopHeight = Math.sin(hopProgress * Math.PI) * 34;
        }
        const gait = Math.sin(_time / 130);
        const bob = walking ? Math.abs(gait) * 2.2 : Math.sin(_time / 620) * .65;
        this.walkerLegLeft.setAngle(walking ? gait * 12 : 0);
        this.walkerLegRight.setAngle(walking ? -gait * 12 : 0);
        this.walker.setPosition(this.walkerX * this.scale.width, this.walkerY * this.scale.height + bob - hopHeight).setDepth(this.walkerY * this.scale.height + 2).setScale(.85 + this.walkerY * .35);
        const mode = latestRef.current.view;
        if (mode === 'first') this.cameras.main.centerOn(this.walkerX * this.scale.width, this.walkerY * this.scale.height - 45);
        else if (mode === 'second') this.cameras.main.centerOn(this.walkerX * this.scale.width + 85, this.walkerY * this.scale.height - 32);
        else this.cameras.main.centerOn(this.walkerX * this.scale.width, this.walkerY * this.scale.height - 70);
      }
    }
    const game = new Phaser.Game({ type: Phaser.AUTO, parent: hostRef.current, width: 960, height: 500, backgroundColor: '#181d28', scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [MarsOutpost], render: { antialias: true, pixelArt: false }, audio: { noAudio: true } });
    return () => { sceneRef.current = null; game.destroy(true); };
  }, []);

  useEffect(() => { sceneRef.current?.paint(); }, [snapshot, selectedBuildingId]);
  useEffect(() => { sceneRef.current?.applyView(view); }, [view]);
  return <div className={`outpost-canvas view-${view}`} ref={hostRef} aria-label="Walkable 2.5D Mars outpost. Move with WASD or arrow keys; use the view selector to change camera." />;
}

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function drawBuilding(scene, building, selected, onSelect) {
  const x = scene.scale.width * building.x;
  const y = scene.scale.height * building.y;
  const palette = building.kind === 'habitat' ? 0xded5c7 : building.kind === 'solar' ? 0x52a1bf : building.kind === 'lifeSupport' ? 0xa7aaa7 : building.kind === 'shelter' ? 0xb68d6a : 0x8eb17e;
  const group = scene.add.container(x, y).setSize(132, 102).setInteractive({ useHandCursor: true });
  const glow = scene.add.ellipse(0, 19, 122, 30, selected ? 0xf2a05b : 0x211f1c, selected ? 0.3 : 0.45);
  group.add(glow);
  if (building.kind === 'habitat') {
    group.add(scene.add.rectangle(0, 2, 82, 48, palette, 1).setStrokeStyle(3, 0x34312d));
    group.add(scene.add.triangle(0, -27, -42, 14, 0, -12, 42, 14, 0x9f5e41).setStrokeStyle(3, 0x34312d));
    group.add(scene.add.rectangle(0, 13, 16, 26, 0x4a6571));
    group.add(scene.add.rectangle(-28, 0, 15, 12, 0x76a9ba));
  } else if (building.kind === 'solar') {
    group.add(scene.add.rectangle(0, 0, 88, 10, 0x484b55).setAngle(-12));
    for (let i = -3; i <= 3; i += 1) group.add(scene.add.rectangle(i * 12, -3, 8, 27, palette).setStrokeStyle(1, 0x243d4c).setAngle(-12));
    group.add(scene.add.rectangle(0, 17, 8, 25, 0xb2a18c));
  } else if (building.kind === 'greenhouse') {
    group.add(scene.add.rectangle(0, 1, 74, 42, 0x506c4e).setStrokeStyle(3, 0x303a2d));
    group.add(scene.add.rectangle(0, -21, 74, 7, 0x9bc4c8, 0.75));
    for (let i = -2; i <= 2; i += 1) group.add(scene.add.rectangle(i * 13, 4, 5, 25, palette));
  } else if (building.kind === 'lifeSupport') {
    group.add(scene.add.rectangle(0, 1, 64, 40, 0x777e7c).setStrokeStyle(3, 0x343b3b));
    group.add(scene.add.circle(-20, 1, 11, 0x9bb6b2).setStrokeStyle(2, 0x343b3b));
    group.add(scene.add.circle(20, 1, 11, 0x7fa5a7).setStrokeStyle(2, 0x343b3b));
    group.add(scene.add.rectangle(0, -25, 28, 8, 0xd1bd9c).setStrokeStyle(2, 0x343b3b));
    group.add(scene.add.rectangle(0, 22, 8, 11, 0xc0b49f));
  } else if (building.kind === 'shelter') {
    group.add(scene.add.rectangle(0, 5, 74, 33, 0x9a795d).setStrokeStyle(3, 0x42372f));
    group.add(scene.add.triangle(0, -17, -43, 16, 0, -16, 43, 16, 0x765845).setStrokeStyle(3, 0x42372f));
    group.add(scene.add.rectangle(0, 13, 14, 25, 0x414d52));
    group.add(scene.add.star(0, -2, 8, 4, 9, 0xead1a8));
  } else {
    group.add(scene.add.ellipse(0, 1, 54, 30, 0x817765).setStrokeStyle(3, 0x38332e));
    group.add(scene.add.rectangle(-4, -8, 40, 15, 0x9c927f).setStrokeStyle(2, 0x38332e));
    group.add(scene.add.circle(13, -13, 8, 0x7795a2));
    group.add(scene.add.circle(-18, 16, 7, 0x36332f)); group.add(scene.add.circle(16, 16, 7, 0x36332f));
  }
  const label = scene.add.text(0, 43, building.name.toUpperCase(), {
    fontFamily: 'Aptos, Arial, sans-serif', fontSize: '11px', color: '#f0e9dd',
    fontStyle: 'bold', stroke: '#211e1a', strokeThickness: 4,
  }).setOrigin(0.5);
  group.add(label);
  const status = scene.add.text(0, 59, building.status === 'online' ? 'ONLINE' : 'STANDBY', {
    fontFamily: 'Aptos, Arial, sans-serif', fontSize: '9px', color: building.status === 'online' ? '#a8d19c' : '#e4b174',
    stroke: '#211e1a', strokeThickness: 3,
  }).setOrigin(0.5);
  group.add(status);
  group.on('pointerover', () => group.setScale(1.04));
  group.on('pointerout', () => group.setScale(1));
  group.on('pointerdown', onSelect);
  if (selected) group.setScale(1.05);
  return group;
}

export default function OutpostScene({ snapshot, selectedBuildingId, onSelectBuilding }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const latestRef = useRef({ snapshot, selectedBuildingId, onSelectBuilding });
  latestRef.current = { snapshot, selectedBuildingId, onSelectBuilding };

  useEffect(() => {
    if (!hostRef.current) return undefined;
    class MarsOutpost extends Phaser.Scene {
      constructor() { super('MarsOutpost'); }
      create() {
        sceneRef.current = this;
        this.paint();
        this.scale.on('resize', () => this.paint());
      }
      paint() {
        const { width, height } = this.scale;
        this.children.removeAll(true);
        const sky = this.add.graphics();
        sky.fillGradientStyle(0x181d28, 0x181d28, 0x8f4731, 0x8f4731, 1);
        sky.fillRect(0, 0, width, height);
        this.add.circle(width * 0.78, height * 0.23, 43, 0xe9a36b, 0.85);
        this.add.circle(width * 0.78, height * 0.23, 58, 0xe9a36b, 0.1);
        const ridge = this.add.graphics();
        ridge.fillStyle(0x713d31, 1); ridge.fillPoints([
          { x: 0, y: height * 0.52 }, { x: width * 0.18, y: height * 0.42 },
          { x: width * 0.37, y: height * 0.54 }, { x: width * 0.62, y: height * 0.39 },
          { x: width * 0.82, y: height * 0.51 }, { x: width, y: height * 0.4 },
          { x: width, y: height }, { x: 0, y: height },
        ], true);
        const ground = this.add.graphics(); ground.fillStyle(0xa5573b, 1); ground.fillRect(0, height * 0.56, width, height * 0.44);
        for (let i = 0; i < 34; i += 1) {
          const x = ((i * 137) % Math.max(width, 1)); const y = height * 0.6 + ((i * 43) % Math.max(height * 0.4, 1));
          this.add.ellipse(x, y, 2 + (i % 4), 1.5, i % 2 ? 0x713d31 : 0xcf8059, 0.55);
        }
        const state = latestRef.current;
        state.snapshot.buildings.forEach((building) => drawBuilding(
          this, building, building.id === state.selectedBuildingId,
          () => state.onSelectBuilding(building.id),
        ));
      }
    }
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 960,
      height: 500,
      backgroundColor: '#181d28',
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [MarsOutpost],
      render: { antialias: true, pixelArt: false },
      audio: { noAudio: true },
    });
    return () => { sceneRef.current = null; game.destroy(true); };
  }, []);

  useEffect(() => { sceneRef.current?.paint(); }, [snapshot, selectedBuildingId]);
  return <div className="outpost-canvas" ref={hostRef} role="img" aria-label="Interactive Mars outpost. Select a building to inspect it." />;
}

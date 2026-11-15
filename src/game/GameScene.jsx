import { useEffect, useRef } from 'react';

const MAP_W = 480;
const MAP_H = 272;
const TILE = 16;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function drawBuilding(scene, building, ghost = false) {
  const x = building.x * MAP_W;
  const y = building.y * MAP_H;
  const group = scene.add.container(x, y);
  const block = (dx, dy, w, h, color) => group.add(scene.add.rectangle(dx, dy, w, h, color));
  group.add(scene.add.ellipse(0, 13, 37, 12, 0x2c2023, 0.55));
  const alpha = ghost ? 0.55 : 1;
  if (building.kind === 'habitat') {
    block(0, 0, 34, 21, 0x9b8068).setAlpha(alpha); block(0, -12, 28, 5, 0xd1b994).setAlpha(alpha);
    block(-8, -1, 8, 7, 0x78adb2).setAlpha(alpha); block(8, -1, 8, 7, 0x78adb2).setAlpha(alpha);
    block(0, 9, 5, 11, 0x46363a).setAlpha(alpha);
  } else if (building.kind === 'solar') {
    [-9, 9].forEach((dx) => { block(dx, -2, 15, 14, 0x34647b).setAlpha(alpha); block(dx, 6, 15, 2, 0xa9d3ca).setAlpha(alpha); });
    [-14, -4, 5, 14].forEach((dx) => block(dx, -2, 1, 12, 0x9bc5c8).setAlpha(alpha));
    block(0, 11, 4, 8, 0x85806e).setAlpha(alpha);
  } else if (building.kind === 'greenhouse') {
    block(0, 0, 34, 22, 0x48674d).setAlpha(alpha); block(0, -11, 33, 4, 0x99c7b3).setAlpha(alpha);
    [-10, 0, 10].forEach((dx) => { block(dx, 0, 4, 12, 0xb4d291).setAlpha(alpha); block(dx, -6, 6, 4, 0x648c60).setAlpha(alpha); });
  } else if (building.kind === 'lifeSupport') {
    block(0, 0, 30, 23, 0x62666a).setAlpha(alpha); block(-8, 0, 10, 11, 0x92b4b0).setAlpha(alpha); block(8, 0, 10, 11, 0x92b4b0).setAlpha(alpha); block(0, -14, 19, 4, 0xc3b394).setAlpha(alpha);
  } else if (building.kind === 'shelter') {
    block(0, 0, 32, 22, 0x8a6d59).setAlpha(alpha); block(0, -12, 36, 5, 0x50393a).setAlpha(alpha); block(0, 8, 5, 12, 0x39363a).setAlpha(alpha); block(12, -3, 4, 4, 0xe1ae6d).setAlpha(alpha);
  } else {
    block(0, 4, 32, 8, 0x554740).setAlpha(alpha); block(0, -2, 27, 12, 0xa99c84).setAlpha(alpha); block(-12, 8, 7, 6, 0x5a7577).setAlpha(alpha); block(13, 8, 7, 6, 0x5a7577).setAlpha(alpha);
  }
  if (!ghost) group.add(scene.add.rectangle(0, 20, 5, 4, building.status === 'online' ? 0xa5cf82 : 0xd39662));
  if (ghost) group.add(scene.add.rectangle(0, 0, 48, 42).setStrokeStyle(1, 0xf1c57e).setFillStyle(0xf1c57e, 0.12));
  return group;
}

function drawNode(scene, node) {
  if (!node.amount) return;
  const x = node.x * MAP_W;
  const y = node.y * MAP_H;
  const group = scene.add.container(x, y);
  const pixel = (dx, dy, w, h, color) => group.add(scene.add.rectangle(dx, dy, w, h, color));
  group.add(scene.add.ellipse(0, 8, 29, 9, 0x302225, 0.58));
  if (node.kind === 'alloy') {
    pixel(-8, 0, 11, 10, 0x7d7a73); pixel(2, -5, 12, 13, 0xb8a78d); pixel(9, 3, 9, 8, 0x69666a); pixel(2, -7, 4, 3, 0xe0c38e);
  } else if (node.kind === 'ice') {
    pixel(-5, 0, 9, 14, 0x6397a8); pixel(2, -7, 8, 19, 0xc7e5dc); pixel(9, 2, 8, 11, 0x8ec9cf); pixel(2, -9, 3, 5, 0xf0f4de);
  } else {
    pixel(-8, 2, 10, 8, 0x774638); pixel(0, -4, 13, 14, 0xb5794e); pixel(8, 3, 10, 9, 0x825540); pixel(0, -6, 4, 3, 0xd69a62);
  }
  group.setAlpha(node.amount < 2 ? 0.68 : 1);
}

function drawLeader(scene, avatarId = 'ember') {
  const x = scene.playerX;
  const y = scene.playerY;
  const body = scene.add.container(x, y);
  const pixel = (dx, dy, w, h, color) => body.add(scene.add.rectangle(dx, dy, w, h, color));
  body.add(scene.add.ellipse(0, 10, 13, 6, 0x211b20, 0.7));
  const suit = avatarId === 'nova' ? 0x3f817e : avatarId === 'orbit' ? 0x72608f : 0x9a603d;
  pixel(0, 5, 10, 9, suit); pixel(0, -5, 11, 11, 0xcbb99e);
  pixel(0, -12, 14, 5, 0xe4d7c1); pixel(0, -5, 7, 4, 0x6396a0);
  pixel(-7, -1, 4, 10, suit); pixel(7, -1, 4, 10, suit);
  pixel(-7, 6, 4, 7, 0xd8cbb6); pixel(7, 6, 4, 7, 0xd8cbb6);
  pixel(-6, 15, 4, 4, 0x42383b); pixel(6, 15, 4, 4, 0x42383b);
  pixel(-9, 1, 3, 9, 0x625b51); pixel(0, 8, 6, 2, 0xe0bd80);
  scene.leaderSprite = body;
}

function drawCrewMate(scene, x, y, color, kind = 'human') {
  const body = scene.add.container(x, y);
  const pixel = (dx, dy, w, h, tint) => body.add(scene.add.rectangle(dx, dy, w, h, tint));
  body.add(scene.add.ellipse(0, 9, 12, 5, 0x211b20, 0.65));
  if (kind === 'bot') {
    pixel(0, -1, 13, 13, 0x708f91); pixel(0, -10, 14, 7, 0x9bb9b6); pixel(-3, -10, 2, 2, 0xe4c887); pixel(3, -10, 2, 2, 0xe4c887); pixel(0, 7, 5, 5, 0x52686d);
  } else {
    pixel(0, 3, 9, 11, color); pixel(0, -7, 10, 10, 0xc9b9a2); pixel(0, -13, 13, 5, 0xe1d2bd); pixel(0, -7, 6, 3, 0x5d8990); pixel(-5, 14, 4, 4, 0x42383b); pixel(5, 14, 4, 4, 0x42383b);
  }
  return body;
}

function terrainColor(x, y) {
  const noise = (x * 19 + y * 23 + (x * y) % 31) % 9;
  return noise === 0 ? 0x8c5e49 : noise < 3 ? 0x785046 : noise === 4 ? 0x69474a : 0x76504a;
}

export default function GameScene({ snapshot, selectedBuildingId, placementTarget, playerPosition, moveCommand, avatarId, reducedMotion, paused, onSelectBuilding, onPlaceBuilding, onGather, onPlayerPosition, onMoveTo }) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const latest = useRef({ snapshot, selectedBuildingId, placementTarget, playerPosition, moveCommand, avatarId, reducedMotion, onSelectBuilding, onPlaceBuilding, onGather, onPlayerPosition, onMoveTo });
  latest.current = { snapshot, selectedBuildingId, placementTarget, playerPosition, moveCommand, avatarId, reducedMotion, onSelectBuilding, onPlaceBuilding, onGather, onPlayerPosition, onMoveTo };

  const handleMapPointerDown = (event) => {
    const state = latest.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * MAP_W;
    const py = ((event.clientY - rect.top) / rect.height) * MAP_H;
    const x = px / MAP_W;
    const y = py / MAP_H;
    // A build placement is an explicit mode: do not let nearby deposits steal the click.
    if (state.placementTarget) {
      const tx = Math.max(0, Math.min(1, Math.round(px / TILE) * TILE / MAP_W));
      const ty = Math.max(0, Math.min(1, Math.round(py / TILE) * TILE / MAP_H));
      if (tx > 0.08 && tx < 0.92 && ty > 0.33 && ty < 0.91) state.onPlaceBuilding({ buildingId: state.placementTarget.buildingId, x: tx, y: ty });
      return;
    }
    const nearestNode = (state.snapshot?.gatherNodes || []).filter((item) => item.amount > 0).map((node) => ({ node, distance: Math.hypot(px - node.x * MAP_W, py - node.y * MAP_H) })).sort((a, b) => a.distance - b.distance)[0];
    if (nearestNode && nearestNode.distance < 25) { state.onGather(nearestNode.node.id); return; }
    if (nearestNode && nearestNode.distance < 38) { state.onMoveTo({ x: nearestNode.node.x, y: nearestNode.node.y, gatherNodeId: nearestNode.node.id, id: (state.moveCommand?.id || 0) + 1 }); return; }
    const nearestBuilding = (state.snapshot?.buildings || []).filter((item) => item.status === 'online').map((building) => ({ building, distance: Math.hypot(px - building.x * MAP_W, py - building.y * MAP_H) })).sort((a, b) => a.distance - b.distance)[0];
    if (!state.placementTarget && nearestBuilding && nearestBuilding.distance < 29) { state.onSelectBuilding(nearestBuilding.building.id); return; }
    state.onMoveTo({ x, y, id: (state.moveCommand?.id || 0) + 1 });
  };

  useEffect(() => {
    if (!hostRef.current) return undefined;
    let disposed = false;
    let game;
    import('phaser').then(({ default: Phaser }) => {
      if (disposed || !hostRef.current) return;
      class MarsTileWorld extends Phaser.Scene {
        constructor() { super('MarsTileWorld'); }
        create() {
          sceneRef.current = this;
          this.playerX = 240; this.playerY = 188; this.moveTarget = null; this.lastCommandId = 0; this.lastReport = 0;
          this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E');
          this.input.keyboard.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'W', 'A', 'S', 'D', 'E']);
          this.game.canvas.setAttribute('tabindex', '0');
          this.scale.on('resize', () => this.paint());
          this.paint();
        }
        update(_time, delta) {
          const state = latest.current;
          const command = state.moveCommand;
          if (command && command.id !== this.lastCommandId) { this.lastCommandId = command.id; this.moveTarget = { x: command.x * MAP_W, y: command.y * MAP_H }; this.gatherTarget = command.gatherNodeId || null; }
          const speed = Math.min(delta * 0.13, 5);
          let dx = 0; let dy = 0;
          if (this.keys.A.isDown || this.keys.LEFT.isDown) dx -= speed;
          if (this.keys.D.isDown || this.keys.RIGHT.isDown) dx += speed;
          if (this.keys.W.isDown || this.keys.UP.isDown) dy -= speed;
          if (this.keys.S.isDown || this.keys.DOWN.isDown) dy += speed;
          if (!dx && !dy && this.moveTarget) {
            const angle = Phaser.Math.Angle.Between(this.playerX, this.playerY, this.moveTarget.x, this.moveTarget.y);
            const distance = Phaser.Math.Distance.Between(this.playerX, this.playerY, this.moveTarget.x, this.moveTarget.y);
            if (distance < (this.gatherTarget ? 22 : 5)) {
              this.moveTarget = null;
              if (this.gatherTarget) { const nodeId = this.gatherTarget; this.gatherTarget = null; state.onGather(nodeId); }
            }
            else { dx = Math.cos(angle) * speed; dy = Math.sin(angle) * speed; }
          } else if (dx || dy) this.moveTarget = null;
          const nextX = clamp(this.playerX + dx, 10, MAP_W - 10);
          const nextY = clamp(this.playerY + dy, 46, MAP_H - 10);
          const blocked = (state.snapshot?.buildings || []).filter((item) => item.status === 'online').some((item) => Math.hypot(nextX - item.x * MAP_W, nextY - item.y * MAP_H) < 19);
          if (!blocked) { this.playerX = nextX; this.playerY = nextY; }
          if (this.leaderSprite) {
            const walking = Boolean(dx || dy) && !state.reducedMotion;
            this.leaderSprite.setPosition(this.playerX, this.playerY + (walking ? Math.sin(this.time.now / 65) * 1.5 : 0));
          }
          if (!state.reducedMotion && this.crewSprites?.length) this.crewSprites.forEach((sprite, index) => sprite.setY(sprite.baseY + Math.sin(this.time.now / 510 + index * 1.4) * 1.2));
          if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            const nodes = (state.snapshot?.gatherNodes || []).filter((item) => item.amount > 0).map((node) => ({ node, distance: Phaser.Math.Distance.Between(this.playerX, this.playerY, node.x * MAP_W, node.y * MAP_H) })).sort((a, b) => a.distance - b.distance)[0];
            if (nodes && nodes.distance < 38) state.onGather(nodes.node.id);
            else {
              const building = (state.snapshot?.buildings || []).filter((item) => item.status === 'online').map((item) => ({ item, distance: Phaser.Math.Distance.Between(this.playerX, this.playerY, item.x * MAP_W, item.y * MAP_H) })).sort((a, b) => a.distance - b.distance)[0];
              if (building && building.distance < 40) state.onSelectBuilding(building.item.id);
            }
          }
          if (this.time.now - this.lastReport > 300) {
            this.lastReport = this.time.now;
            state.onPlayerPosition({ x: this.playerX / MAP_W, y: this.playerY / MAP_H });
          }
        }
        paint() {
          this.children.removeAll(true);
          const g = this.add.graphics();
          g.fillStyle(0x171e29, 1); g.fillRect(0, 0, MAP_W, MAP_H);
          for (let ty = 0; ty < MAP_H / TILE; ty += 1) for (let tx = 0; tx < MAP_W / TILE; tx += 1) {
            const px = tx * TILE; const py = ty * TILE;
            const ground = py < 55 ? 0x202b39 : py < 78 ? 0x3c3944 : terrainColor(tx, ty);
            g.fillStyle(ground, 1); g.fillRect(px, py, TILE, TILE);
            if (py >= 55 && ((tx * 13 + ty * 17) % 7 === 0)) { g.fillStyle(0xc1825d, 0.45); g.fillRect(px + ((tx + ty) % 9), py + ((tx * 3) % 11), 3, 2); }
            if (py >= 55) { g.lineStyle(1, 0x30272b, 0.2); g.strokeRect(px, py, TILE, TILE); }
          }
          // Layered crater-rim silhouettes give the buildable ground a clear horizon.
          if (latest.current.snapshot?.day === latest.current.snapshot?.durationDays) {
            [44, 32, 21].forEach((radius, index) => { g.fillStyle(index === 0 ? 0xd88b5a : index === 1 ? 0xe8a36a : 0xf0c17b, 0.035 + index * 0.025); g.fillCircle(381, 76, radius); });
          }
          g.fillStyle(0x302e38, 1);
          [[0, 75, 61, 45, 125, 75], [92, 76, 178, 41, 248, 76], [210, 77, 302, 48, 365, 77], [330, 76, 418, 40, 480, 74]].forEach(([x1, y1, x2, y2, x3, y3]) => g.fillTriangle(x1, y1, x2, y2, x3, y3));
          g.fillStyle(0x59403d, 0.9);
          [[0, 82, 74, 62, 148, 82], [124, 83, 206, 58, 280, 83], [255, 82, 356, 60, 430, 82], [390, 82, 448, 64, 480, 82]].forEach(([x1, y1, x2, y2, x3, y3]) => g.fillTriangle(x1, y1, x2, y2, x3, y3));
          // Worn path tiles leading from the lander to the outpost.
          g.fillStyle(0xb08063, 0.28); g.fillRect(208, 106, 64, 150);
          // A pixel landing craft and beacon anchor the empty map after touchdown.
          g.fillStyle(0x4b5558, 1); g.fillRect(202, 91, 32, 8); g.fillRect(209, 86, 18, 5); g.fillStyle(0x9cc2c3, 1); g.fillRect(211, 88, 5, 3); g.fillRect(221, 88, 5, 3); g.fillStyle(0x6d574b, 1); g.fillRect(205, 99, 3, 8); g.fillRect(228, 99, 3, 8);
          const state = latest.current;
          this.crewSprites = [drawCrewMate(this, 221, 159, 0x9a6548), drawCrewMate(this, 258, 161, 0x66816d), drawCrewMate(this, 282, 154, 0x677b83, 'bot')];
          this.crewSprites.forEach((sprite) => { sprite.baseY = sprite.y; });
          if (state.snapshot?.activeEvent) {
            const eventX = state.snapshot.activeEvent.id.includes('relay') ? 373 : state.snapshot.activeEvent.id.includes('sample') ? 362 : 386;
            const eventY = state.snapshot.activeEvent.id.includes('sample') ? 164 : 111;
            g.fillStyle(0xe9a969, 0.13); g.fillCircle(eventX, eventY, 28);
            g.lineStyle(2, 0xe9a969, 0.8); g.strokeCircle(eventX, eventY, 12 + Math.sin(this.time.now / 180) * 2);
            g.fillStyle(0xf4c780, 0.92); g.fillRect(eventX - 2, eventY - 2, 4, 4);
            const signalRing = this.add.ellipse(eventX, eventY, 18, 18, 0xe9a969, 0.34);
            signalRing.setStrokeStyle(2, 0xf4c780, 0.9).setFillStyle(0xe9a969, 0.06);
            this.tweens.add({ targets: signalRing, scaleX: 2.4, scaleY: 2.4, alpha: 0, duration: 1100, repeat: -1, onRepeat: () => { signalRing.setScale(0.6); signalRing.setAlpha(0.7); } });
          }
          (state.snapshot?.hazardZones || []).forEach((zone) => {
            if (!zone.sols.includes(state.snapshot.day)) return;
            g.fillStyle(zone.id === 'dust-front' ? 0xd59862 : 0x83a0b2, 0.15);
            g.fillCircle(zone.x * MAP_W, zone.y * MAP_H, zone.radius * MAP_W);
            g.lineStyle(1, zone.id === 'dust-front' ? 0xf0b87b : 0xa7c3d0, 0.45);
            g.strokeCircle(zone.x * MAP_W, zone.y * MAP_H, zone.radius * MAP_W);
            if (zone.id === 'dust-front') for (let i = 0; i < 9; i += 1) g.lineBetween(zone.x * MAP_W - 32 + i * 7, zone.y * MAP_H - 12 + (i % 3) * 10, zone.x * MAP_W - 4 + i * 7, zone.y * MAP_H - 8 + (i % 3) * 10);
          });
          (state.snapshot?.gatherNodes || []).forEach((node) => drawNode(this, node));
          (state.snapshot?.buildings || []).forEach((building) => {
            if (building.status !== 'online') return;
            if (state.placementTarget?.buildingId === building.id && state.placementTarget.x == null) return;
            const visual = state.placementTarget?.buildingId === building.id ? { ...building, x: state.placementTarget.x, y: state.placementTarget.y } : building;
            drawBuilding(this, visual, state.placementTarget?.buildingId === building.id);
          });
          drawLeader(this, state.avatarId);
          if (this.moveTarget) { g.lineStyle(1, 0xf4d08c, 0.7); g.strokeCircle(this.moveTarget.x, this.moveTarget.y, 6); }
        }
      }
      game = new Phaser.Game({ type: Phaser.CANVAS, parent: hostRef.current, width: MAP_W, height: MAP_H, backgroundColor: '#171e29', pixelArt: true, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [MarsTileWorld], render: { antialias: false, pixelArt: true, roundPixels: true }, audio: { noAudio: true } });
    }).catch(() => hostRef.current?.setAttribute('aria-label', 'The Mars map could not load. Refresh the game to try again.'));
    return () => { disposed = true; sceneRef.current = null; game?.destroy(true); };
  }, []);

  useEffect(() => { sceneRef.current?.paint(); }, [snapshot, selectedBuildingId, placementTarget]);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (paused) scene.scene.pause();
    else scene.scene.resume();
  }, [paused]);
  return <div className="pixel-map" ref={hostRef} onPointerDown={handleMapPointerDown} role="img" aria-label="Tile-based Mars survival world. Move with WASD or arrows. Gather resource deposits with E or click them. Select a build action, then click an empty tile."/>;
}

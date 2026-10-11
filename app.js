import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

// ---------- ことば：ページの lang（ja / en）で切り替える ----------
const STRINGS = {
  ja: {
    perChar: 110,  // 字幕を出しておく長さ（1文字あたりのミリ秒）
    pro1: 'むかし、この谷にも、夜があった。',
    pro2: 'ある夕暮れを最後に、夜は来なくなった。',
    pro3: 'この谷に、夜は来ない。',
    pro4: '水の底のほかには。',
    intro1: '谷のあちこちに、光るかけらが残っている。',
    intro2: '妖精を飛ばして、拾い集めよう。',
    lanternA: '灯籠に火を入れるのは、子どもたちの役目だった。',
    lanternB: '「夜が、迷わずに来られるように」って。',
    lanternF: 'わたしも、いっしょに火を運んだ。あの子の、小さな手のとなりで。',
    umbrellaA: '赤い傘は、あの子のお気に入りだった。',
    umbrellaB: '「あした、取りに来るね」。それが最後の約束。',
    umbrellaF: 'わたしは、「また明日」と言えなかった。',
    bakeryA: 'ここは、パン屋だった。',
    bakeryB: '夕暮れになると、窓から甘い湯気がこぼれていた。',
    bakeryF: '窓辺で、あの子はいつも、わたしにパンのかけらを分けてくれた。',
    millA: '風車は、夜の風で回るのだと教わった。',
    millB: '……風が、少しだけ戻ってきた。',
    millF: '夜が来なければ、さよならも来ない。そう、思っていた。',
    allFound: 'すべてのかけらが、ここにある。',
    toTower: '鐘楼へ。止まった鐘のところへ。',
    refuse1: '鐘は、まだ鳴らない。',
    refuse2: '谷に残る記憶のかけらを、集めなければ。',
    bell1: '鐘が鳴った。',
    bell2: '時を止めていたのは、わたしだった。',
    bell3: '夜が来れば、みんなのいない夜になってしまうと思ったから。',
    bell4: 'けれど、水の底の夜には、ずっと灯りがともっていた。',
    bell5: '待っていたのは、わたしだけじゃなかった。',
    kid1: 'きのうの傘、取りに来たよ。',
    kid2: 'ただいま。',
    kid3: '——おかえりなさい。',
    nightCame: '谷に、やっと夜が来た。',
    theEnd: '— おしまい —',
    afterEnd: 'このまま、夜の谷を飛びつづけられます。',
    progress: '記憶 ',
    soundOn: '音：あり',
    soundOff: '音：なし',
  },
  en: {
    perChar: 48,
    pro1: 'Once, this valley had its nights too.',
    pro2: 'Then, after one last dusk, night stopped coming.',
    pro3: 'Night never comes to this valley.',
    pro4: 'Except beneath the water.',
    intro1: 'Glowing fragments still linger across the valley.',
    intro2: 'Fly the fairy, and gather them.',
    lanternA: 'Lighting the lanterns was the children’s job.',
    lanternB: '“So the night won’t lose its way,” they said.',
    lanternF: 'I carried the flame too, right beside that small hand.',
    umbrellaA: 'The red umbrella was the little one’s favorite.',
    umbrellaB: '“I’ll come back for it tomorrow.” That was the last promise.',
    umbrellaF: 'I never said, “See you tomorrow.”',
    bakeryA: 'This was the bakery.',
    bakeryB: 'At dusk, sweet steam spilled from its windows.',
    bakeryF: 'At the window, the little one always shared a crumb of bread with me.',
    millA: 'They told me the windmill turns on the night wind.',
    millB: '…The wind has come back, just a little.',
    millF: 'If night never came, neither would goodbye. That is what I believed.',
    allFound: 'Every fragment is here now.',
    toTower: 'To the bell tower. To the bell that stopped.',
    refuse1: 'The bell will not ring yet.',
    refuse2: 'First, gather the memories left in the valley.',
    bell1: 'The bell rang.',
    bell2: 'It was I who stopped time.',
    bell3: 'I thought that if night came, it would be a night without everyone.',
    bell4: 'But beneath the water, the lights had been burning all along.',
    bell5: 'I was not the only one who was waiting.',
    kid1: 'I came back for my umbrella. From yesterday.',
    kid2: 'I’m home.',
    kid3: '—Welcome home.',
    nightCame: 'At last, night came to the valley.',
    theEnd: '— The End —',
    afterEnd: 'You can keep flying through the night valley.',
    progress: 'Memories ',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
  },
};
const S = STRINGS[document.documentElement.lang === 'en' ? 'en' : 'ja'];

// ---------- 設定（ここを動かすと印象が大きく変わる） ----------
const CFG = {
  sunElevation: 5,        // 太陽の高さ（低いほど夕暮れ感）
  sunAzimuth: 235,        // 太陽の方位
  haze: 0xf2c9a0,         // 遠景の霞色（夕焼けの金色）
  lakeLevel: 5,
  treeCount: 3500,
};
// スマホ・タブレットでは描画を少し軽くする
const TOUCH = matchMedia('(pointer: coarse)').matches;

// ---------- Renderer / Scene / Camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, TOUCH ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(CFG.haze, 180, 1100); // 遠いほど空色・霞色になじむ

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 5000);
camera.position.set(-130, 46, 150);  // 湖を見下ろす草原から

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-35, 6, 10);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.48;
controls.minDistance = 4;   // 妖精に寄れるように
controls.maxDistance = 500;

// ---------- Sky（夕暮れの大気） ----------
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);
const su = sky.material.uniforms;
su.turbidity.value = 8;          // 大気の濁り → 柔らかい光
su.rayleigh.value = 2.2;         // 青の散乱を抑え、暖色寄りに
su.mieCoefficient.value = 0.02;  // 太陽の周りのにじみ
su.mieDirectionalG.value = 0.9;

const sunDir = new THREE.Vector3().setFromSphericalCoords(
  1,
  THREE.MathUtils.degToRad(90 - CFG.sunElevation),
  THREE.MathUtils.degToRad(CFG.sunAzimuth)
);
su.sunPosition.value.copy(sunDir);

// ---------- Lights（金色の斜光＋やわらかい空の環境光） ----------
const sunLight = new THREE.DirectionalLight(0xffc27a, 2.5);
sunLight.position.copy(sunDir).multiplyScalar(500);
sunLight.castShadow = true;
sunLight.shadow.mapSize.setScalar(TOUCH ? 2048 : 4096);
Object.assign(sunLight.shadow.camera, { left: -450, right: 450, top: 450, bottom: -450, far: 1200 });
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);
// 影を落とさない同方向の弱い光：丘の影が真っ黒に沈まず、夕陽が回り込んで見える
const fillLight = new THREE.DirectionalLight(0xffb98a, 0.7);
fillLight.position.copy(sunLight.position);
scene.add(fillLight);
const hemiLight = new THREE.HemisphereLight(0xc4d6f5, 0x7a5638, 1.15); // 夕陽の届かない斜面にも、空の青と地面の照り返し
scene.add(hemiLight);

// ---------- 地形の高さ関数 ----------
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 6; i++) { v += amp * noise(x * f, y * f); f *= 2; amp *= 0.5; }
  return v;
}
const LAKE = { x: -40, z: 30, r: 90 };
function heightAt(x, z) {
  // 遠景の山並み（大きく、ゆるやかに）
  let h = Math.pow(fbm(x * 0.0035, z * 0.0035), 1.6) * 260;
  // 中景の丘（谷と尾根の筋）
  h += Math.pow(fbm(x * 0.012 + 40, z * 0.012), 2) * 26;
  // 細部のざらつき
  h += (fbm(x * 0.05, z * 0.05) - 0.5) * 2.5;
  // 湖の盆地：中心に近づくほど水面近くまで沈める
  const d = Math.hypot(x - LAKE.x, z - LAKE.z);
  const basin = THREE.MathUtils.smoothstep(d, LAKE.r * 0.55, LAKE.r * 1.25);
  h = THREE.MathUtils.lerp(CFG.lakeLevel - 3, h, basin);
  // 手前（カメラ側）は緩やかな草原に
  const near = THREE.MathUtils.smoothstep(Math.hypot(x + 170, z - 230), 80, 260);
  h *= THREE.MathUtils.lerp(0.25, 1, near);
  return h - 6;
}

// ---------- 地形メッシュ ----------
const SIZE = 2000, SEG = 360;
const terrainGeo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
terrainGeo.rotateX(-Math.PI / 2);
const pos = terrainGeo.attributes.position;
for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
terrainGeo.computeVertexNormals();

const nrm = terrainGeo.attributes.normal;
const colors = [];
const cSand  = new THREE.Color('#e6cf9a');
const cMeadow = new THREE.Color('#9bb35a');  // 夕陽で映える黄緑
const cForest = new THREE.Color('#4f7a3a');
const cRock  = new THREE.Color('#8c7460');
const cSnow  = new THREE.Color('#fbf3ea');
const tmp = new THREE.Color();
for (let i = 0; i < pos.count; i++) {
  const h = pos.getY(i), slope = 1 - nrm.getY(i);
  tmp.copy(cMeadow);
  tmp.lerp(cForest, THREE.MathUtils.smoothstep(h, 18, 60));
  const shore = 1 - THREE.MathUtils.smoothstep(Math.hypot(pos.getX(i) - LAKE.x, pos.getZ(i) - LAKE.z), LAKE.r * 0.9, LAKE.r * 1.15);
  tmp.lerp(cSand, THREE.MathUtils.smoothstep(h, 4, -1) * shore); // 湖畔の砂地
  tmp.lerp(cRock, THREE.MathUtils.smoothstep(slope, 0.18, 0.45));
  tmp.lerp(cSnow, THREE.MathUtils.smoothstep(h, 150, 200));
  colors.push(tmp.r, tmp.g, tmp.b);
}
terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
const terrain = new THREE.Mesh(
  terrainGeo,
  new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 })
);
terrain.receiveShadow = true;
scene.add(terrain);

// ---------- 湖（映り込み＋水の色） ----------
// 映り込みをさざ波でゆらし、岸に近いほど浅瀬の色になじませる
const WaterShader = {
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */`
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vLocal;
    varying vec3 vWorld;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vLocal = uv;
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    uniform float uTime;
    varying vec4 vUv;
    varying vec2 vLocal;
    varying vec3 vWorld;
    #include <logdepthbuf_pars_fragment>
    float blendOverlay(float base, float blend) {
      return (base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)));
    }
    vec3 blendOverlay(vec3 base, vec3 blend) {
      return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
    }
    void main() {
      #include <logdepthbuf_fragment>
      vec2 p = vWorld.xz;
      vec2 ripple = vec2(
        sin(p.y * 0.35 + uTime * 0.9) + 0.6 * sin(p.x * 0.21 - uTime * 0.6),
        cos(p.x * 0.30 + uTime * 0.8) + 0.6 * cos(p.y * 0.17 + uTime * 0.5)
      );
      vec4 uv = vUv;
      uv.xy += ripple * 0.0035 * uv.w;
      vec3 col = blendOverlay(texture2DProj(tDiffuse, uv).rgb, color);
      float edge = smoothstep(0.9, 1.0, length(vLocal - 0.5) * 2.0);
      col = mix(col, vec3(0.5, 0.43, 0.32), edge * 0.6);
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};
const lake = new Reflector(new THREE.CircleGeometry(LAKE.r * 0.9, 64), {
  textureWidth: 1024, textureHeight: 1024, color: 0xa8c4cc, shader: WaterShader,
});
lake.rotation.x = -Math.PI / 2;
lake.position.set(LAKE.x, CFG.lakeLevel, LAKE.z);
scene.add(lake);

const lakeTint = new THREE.Mesh(
  new THREE.CircleGeometry(LAKE.r * 0.9, 64),
  new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.06, depthWrite: false })
);
lakeTint.rotation.x = -Math.PI / 2;
lakeTint.position.set(LAKE.x, CFG.lakeLevel + 0.05, LAKE.z);
scene.add(lakeTint);

// ---------- 木々（風に揺れる） ----------
const windUniform = { value: 0 };
const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 4, 6); trunkGeo.translate(0, 2, 0);
const leafGeo = new THREE.ConeGeometry(3.2, 10, 7);            leafGeo.translate(0, 9, 0);
const trunks = new THREE.InstancedMesh(
  trunkGeo, new THREE.MeshStandardMaterial({ color: 0x4e3a2a }), CFG.treeCount
);
const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
leafMat.onBeforeCompile = (shader) => {
  shader.uniforms.uWind = windUniform;
  shader.vertexShader = 'uniform float uWind;\n' + shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
     float swayAmt = max(position.y, 0.0) * 0.035;
     transformed.x += sin(uWind * 1.6 + position.y * 0.6) * swayAmt;
     transformed.z += cos(uWind * 1.3 + position.y * 0.5) * swayAmt * 0.6;`
  );
};
const leaves = new THREE.InstancedMesh(leafGeo, leafMat, CFG.treeCount);
trunks.castShadow = leaves.castShadow = true;

// 見る人の立つ草原と、そこから湖までの視線の通り道には木を植えない
const VIEW = { x: camera.position.x, z: camera.position.z };
function distToViewLine(x, z) {
  const ax = LAKE.x - VIEW.x, az = LAKE.z - VIEW.z;
  const t = THREE.MathUtils.clamp(((x - VIEW.x) * ax + (z - VIEW.z) * az) / (ax * ax + az * az), 0, 1);
  return Math.hypot(x - (VIEW.x + ax * t), z - (VIEW.z + az * t));
}

// 向こう岸の村の跡地（家は水の中にだけ建っている）。木は村の敷地を避けて生える
const VILLAGE = [];
for (let i = 0; i < 8; i++) {
  const a = -1.75 + i * 0.2 + (hash(i, 1) - 0.5) * 0.08;
  const r = LAKE.r * (1.1 + hash(i, 2) * 0.2);
  VILLAGE.push({
    x: LAKE.x + Math.cos(a) * r, z: LAKE.z + Math.sin(a) * r,
    w: 6 + hash(i, 3) * 3, hgt: 4.5 + hash(i, 4) * 1.5, d: 6,
  });
}
const nearVillage = (x, z) => VILLAGE.some(v => Math.hypot(x - v.x, z - v.z) < 11);
// 風車は開けた草地に立っている
const MILL = { x: 80, z: -30 };
const nearMill = (x, z) => Math.hypot(x - MILL.x, z - MILL.z) < 30;

const dummy = new THREE.Object3D();
const palette = ['#2f5d24', '#3f7330', '#58843c', '#6b8f45', '#8a6a3a'].map(c => new THREE.Color(c));
let placed = 0;
for (let tries = 0; tries < CFG.treeCount * 5 && placed < CFG.treeCount; tries++) {
  const x = (Math.random() - 0.5) * 700;
  const z = (Math.random() - 0.5) * 700;
  const h = heightAt(x, z);
  const dLake = Math.hypot(x - LAKE.x, z - LAKE.z);
  if (h < 10 || h > 110 || dLake < LAKE.r * 1.05) continue;
  if (Math.hypot(x - VIEW.x, z - VIEW.z) < 45 || distToViewLine(x, z) < 30 || nearVillage(x, z) || nearMill(x, z)) continue;
  const s = 0.6 + Math.random() * 0.9;
  dummy.position.set(x, h, z);
  dummy.rotation.y = Math.random() * Math.PI * 2;
  dummy.scale.set(s, s * (0.8 + Math.random() * 0.4), s);
  dummy.updateMatrix();
  trunks.setMatrixAt(placed, dummy.matrix);
  leaves.setMatrixAt(placed, dummy.matrix);
  leaves.setColorAt(placed, palette[Math.floor(Math.random() * palette.length)]);
  placed++;
}
trunks.count = leaves.count = placed;
scene.add(trunks, leaves);

// ---------- やわらかな光のにじみ（粒・灯り・月で共用） ----------
function glowTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([at, col]) => grd.addColorStop(at, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowTex = glowTexture([
  [0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)'],
]);

// ---------- 光の粒（夕陽を受けて漂う花粉） ----------
const PARTICLES = 1200;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PARTICLES * 3);
const pCol = new Float32Array(PARTICLES * 3);
const moteTones = ['#ffd38a', '#ffc08a', '#fff0d2', '#ffe2a8'].map(c => new THREE.Color(c));
for (let i = 0; i < PARTICLES; i++) {
  pPos[i * 3]     = (Math.random() - 0.5) * 500;
  pPos[i * 3 + 1] = Math.random() * 60 + 2;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 500;
  moteTones[i % moteTones.length].toArray(pCol, i * 3);
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const moteMat = new THREE.PointsMaterial({
  map: glowTex, vertexColors: true, size: 1.6, transparent: true, opacity: 0.7,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
});
const motes = new THREE.Points(pGeo, moteMat);
scene.add(motes);

// ---------- 夕雲（地平線近くにたなびく薄い雲） ----------
function cloudTexture(seed) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 70; i++) {
    const x = 40 + hash(seed, i) * 432;
    const y = 64 + (hash(seed, i + 100) - 0.5) * 50 * Math.sin((x / 512) * Math.PI);
    const r = 14 + hash(seed, i + 200) * 34;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.22)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const clouds = [];
const cloudNear = new THREE.Color('#ffd9a8'), cloudFar = new THREE.Color('#d9a6b4');
for (let i = 0; i < 10; i++) {
  const az = CFG.sunAzimuth - 110 + i * 24 + (hash(i, 7) - 0.5) * 14;
  const el = 4 + hash(i, 8) * 9;
  const nearSun = 1 - Math.min(Math.abs(az - CFG.sunAzimuth) / 110, 1);
  const mat = new THREE.SpriteMaterial({
    map: cloudTexture(i + 1), transparent: true, depthWrite: false, fog: false,
    color: cloudFar.clone().lerp(cloudNear, nearSun), opacity: 0.55 + nearSun * 0.4,
  });
  const cloud = new THREE.Sprite(mat);
  cloud.position.setFromSphericalCoords(2600, THREE.MathUtils.degToRad(90 - el), THREE.MathUtils.degToRad(az));
  cloud.scale.set(900 + hash(i, 9) * 700, 160 + hash(i, 10) * 90, 1);
  clouds.push({ mat, day: mat.color.clone(), dayOpacity: mat.opacity });
  scene.add(cloud);
}

// ---------- 足もとの草（見る人の立つ草原だけ） ----------
const bladeGeo = new THREE.BufferGeometry();
bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute([
  -0.18, 0, 0,  0.18, 0, 0,  -0.1, 0.7, 0,
   0.18, 0, 0,  0.1, 0.7, 0,  -0.1, 0.7, 0,
  -0.1, 0.7, 0,  0.1, 0.7, 0,  0, 1.4, 0.15,
], 3));
bladeGeo.computeVertexNormals();
const grassMat = new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide });
grassMat.onBeforeCompile = (shader) => {
  shader.uniforms.uWind = windUniform;
  shader.vertexShader = 'uniform float uWind;\n' + shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
     vec4 gw = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
     float bend = position.y * position.y * 0.25;
     transformed.x += (sin(uWind * 1.8 + gw.x * 0.15 + gw.z * 0.1) * 0.6 + 0.4) * bend;
     transformed.z += cos(uWind * 1.4 + gw.z * 0.12) * bend * 0.4;`
  );
};
const GRASS = TOUCH ? 22000 : 45000;
const grass = new THREE.InstancedMesh(bladeGeo, grassMat, GRASS);
grass.receiveShadow = true;
const grassTones = ['#7f9a43', '#93ab4f', '#a9b85a', '#6f8a3c', '#c2b866'].map(c => new THREE.Color(c));
let blades = 0;
for (let tries = 0; tries < GRASS * 3 && blades < GRASS; tries++) {
  const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 150;
  const x = camera.position.x + Math.cos(a) * rr, z = camera.position.z + Math.sin(a) * rr;
  if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r * 1.12) continue;
  const h = heightAt(x, z);
  if (h < CFG.lakeLevel + 1) continue;
  const s = 0.4 + Math.random() * 0.5;
  dummy.position.set(x, h - 0.05, z);
  dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
  dummy.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
  dummy.updateMatrix();
  grass.setMatrixAt(blades, dummy.matrix);
  grass.setColorAt(blades, grassTones[Math.floor(Math.random() * grassTones.length)]);
  blades++;
}
grass.count = blades;
scene.add(grass);

// ---------- 時間の止まった痕跡（かつてここにいた誰かの名残） ----------
const relics = new THREE.Group();
scene.add(relics);
const woodMat  = new THREE.MeshStandardMaterial({ color: 0x6e5440, roughness: 0.9 });
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9d9488, roughness: 0.95 });
const brassMat = new THREE.MeshStandardMaterial({ color: 0xb8893f, roughness: 0.45, metalness: 0.4, side: THREE.DoubleSide });
const faceMat  = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffd9a0, emissiveIntensity: 0.25 });
const handMat  = new THREE.MeshStandardMaterial({ color: 0x3a2a20 });

// 湖の向こう岸の丘に建つ鐘楼：時計の針は止まったまま
const tower = new THREE.Group();
const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 26, 10), stoneMat);
towerBody.position.y = 13;
// 吹き抜けの鐘室：四本の柱のあいだに鐘が吊られている
const belfryFloor = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 0.6, 10), stoneMat);
belfryFloor.position.y = 26.3;
tower.add(belfryFloor);
for (let i = 0; i < 4; i++) {
  const a = i * Math.PI / 2 + Math.PI / 4;
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 0.8), stoneMat);
  pillar.position.set(Math.cos(a) * 3.5, 29.5, Math.sin(a) * 3.5);
  tower.add(pillar);
}
const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(6, 10, 10), woodMat);
towerRoof.position.y = 37.5;
// 鐘は上端を支点に揺れるよう、形を下へずらしておく
const bell = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 1.6, 2.4, 14, 1, true).translate(0, -1.2, 0),
  brassMat
);
bell.position.y = 32;
const clockFace = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), faceMat);
clockFace.position.set(0, 21, 4.4);
const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.05).translate(0, 0.45, 0), handMat);
hourHand.position.z = 0.03;
const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.05).translate(0, 0.65, 0), handMat);
minuteHand.position.z = 0.04; minuteHand.rotation.z = -1.2;
clockFace.add(hourHand, minuteHand);
tower.add(towerBody, towerRoof, bell, clockFace);
tower.position.set(30, heightAt(30, -95) - 1, -95);
tower.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
relics.add(tower);

// 止まった風車（羽根は夕方の角度で固定）
const mill = new THREE.Group();
const millBody = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 4, 22, 8), woodMat);
millBody.position.y = 11;
const millCap = new THREE.Mesh(new THREE.ConeGeometry(3.4, 4, 8), woodMat);
millCap.position.y = 24;
const sails = new THREE.Group();
sails.position.set(0, 21, 2.8);
for (let i = 0; i < 4; i++) {
  const blade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 13, 0.25), woodMat);
  blade.position.y = 6.5;
  const arm = new THREE.Group();
  arm.add(blade);
  arm.rotation.z = i * Math.PI / 2 + 0.4;
  sails.add(arm);
}
mill.add(millBody, millCap, sails);
const millX = MILL.x, millZ = MILL.z;
mill.position.set(millX, heightAt(millX, millZ), millZ);
mill.rotation.y = Math.atan2(camera.position.x - millX, camera.position.z - millZ);
mill.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
relics.add(mill);

// ---------- 水鏡の向こう側（湖面にだけ映る、来なかった夜の谷） ----------
// mirrorWorld は湖の映り込みを描くときだけ表示される
const mirrorWorld = new THREE.Group();
mirrorWorld.visible = false;
scene.add(mirrorWorld);

function haloSprite(color, scale, opacity) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  s.scale.setScalar(scale);
  return s;
}

// 湖畔の灯籠：岸をぐるりと囲んで、すべてが灯っている
const LANTERN_N = 12;
const litGlassMat  = new THREE.MeshStandardMaterial({ color: 0xffe6bf, emissive: 0xff9d45, emissiveIntensity: 2.6 });
const lanternCapGeo = new THREE.ConeGeometry(1.1, 0.9, 4);
const flames = []; // 火ごとに揺れ方をずらす
for (let i = 0; i < LANTERN_N; i++) {
  const a = (i / LANTERN_N) * Math.PI * 2 + 0.3;
  const r = LAKE.r * 1.02;
  const x = LAKE.x + Math.cos(a) * r, z = LAKE.z + Math.sin(a) * r;
  const y = Math.max(heightAt(x, z), CFG.lakeLevel);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.6, 6), woodMat);
  post.position.set(x, y + 1.3, z);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), litGlassMat);
  glass.position.set(x, y + 3.2, z);
  const cap = new THREE.Mesh(lanternCapGeo, woodMat);
  cap.position.set(x, y + 4.35, z);
  cap.rotation.y = Math.PI / 4;
  post.castShadow = cap.castShadow = true;
  const halo = haloSprite(0xff9a4a, 12, 0.55);
  const core = haloSprite(0xffe2b0, 3.5, 0.9);
  halo.position.set(x, y + 3.2, z);
  core.position.copy(halo.position);
  const warm = new THREE.PointLight(0xff9d55, 8, 28, 2);
  warm.position.set(x, y + 3.5, z);
  relics.add(post, glass, cap, halo, core, warm);
  flames.push({ halo: halo.material, core: core.material, light: warm, phase: hash(i, 11) * 100, pos: halo.position.clone() });
}

// 向こう岸の村：窓に灯りのともる家々（水の中にだけある）
const houseWallMat = new THREE.MeshStandardMaterial({ color: 0xcdb89a, roughness: 0.9 });
const houseRoofMat = new THREE.MeshStandardMaterial({ color: 0x6a3b2e, roughness: 0.8 });
const windowMat = new THREE.MeshBasicMaterial({ color: 0xffbf6e });
const windowGeo = new THREE.PlaneGeometry(1.1, 1.3);
const ruinMat = new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: 1 });
for (const { x, z, w, hgt, d } of VILLAGE) {
  const y = heightAt(x, z) - 0.5;
  const face = Math.atan2(LAKE.x - x, LAKE.z - z); // 窓を湖へ向ける

  // こちらの世界：崩れた石の土台だけが残っている
  const ruin = new THREE.Group();
  const sides = [[0, d / 2, w, 0.9], [0, -d / 2, w * 0.55, 0.6], [w / 2, 0, d, 1.2], [-w / 2, 0, d * 0.4, 0.5]];
  sides.forEach(([sx, sz, len, wallH], k) => {
    const vertical = k >= 2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(vertical ? 0.6 : len, wallH, vertical ? len : 0.6), ruinMat);
    wall.position.set(sx, wallH / 2, sz);
    wall.castShadow = wall.receiveShadow = true;
    ruin.add(wall);
  });
  ruin.position.set(x, y, z);
  ruin.rotation.y = face;
  relics.add(ruin);

  // 水の中の世界：同じ場所に、灯りのともる家が建っている
  const house = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, d), houseWallMat);
  walls.position.y = hgt / 2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 3.6, 4), houseRoofMat);
  roof.position.y = hgt + 1.8;
  roof.rotation.y = Math.PI / 4;
  house.add(walls, roof);
  for (const wx of [-w * 0.25, w * 0.25]) {
    const win = new THREE.Mesh(windowGeo, windowMat);
    win.position.set(wx, hgt * 0.5, d / 2 + 0.02);
    house.add(win);
  }
  const glow = haloSprite(0xffa04a, 15, 0.6);
  glow.position.set(0, hgt * 0.5, d / 2 + 1);
  house.add(glow);
  house.position.set(x, y, z);
  house.rotation.y = face;
  mirrorWorld.add(house);
}

// 星と月（鐘が鳴るまで、こちらの空には出ない）
const STARS = 1500;
const sPos = new Float32Array(STARS * 3);
for (let i = 0; i < STARS; i++) {
  const v = new THREE.Vector3().setFromSphericalCoords(
    3000, Math.acos(Math.random() * 0.95), Math.random() * Math.PI * 2
  );
  v.toArray(sPos, i * 3);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
mirrorWorld.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: 0xdfe8ff, size: 1.6, sizeAttenuation: false, fog: false,
  transparent: true, opacity: 0.9, depthWrite: false,
})));

const moonDir = new THREE.Vector3(controls.target.x - camera.position.x, 0, controls.target.z - camera.position.z)
  .normalize().multiplyScalar(Math.cos(THREE.MathUtils.degToRad(16)));
moonDir.y = Math.sin(THREE.MathUtils.degToRad(16));
const moonPos = moonDir.clone().multiplyScalar(2800).add(camera.position);
const moonTex = glowTexture([
  [0, 'rgba(255,255,255,1)'], [0.42, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)'],
]);
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, color: 0xfff4dc, fog: false, depthWrite: false }));
moon.scale.setScalar(150);
moon.position.copy(moonPos);
const moonGlow = haloSprite(0x9fb8ff, 700, 0.35);
moonGlow.material.fog = false;
moonGlow.position.copy(moonPos);
mirrorWorld.add(moonGlow, moon);

// ---------- 黄昏と夜：k = 0 が黄昏、1 が夜 ----------
// 湖の映り込みはいつも夜（k = 1）。こちらの世界は、鐘が鳴ると少しずつ夜になる
const NIGHT = {
  sun: new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 + 4), THREE.MathUtils.degToRad(CFG.sunAzimuth)),
  fog: new THREE.Color(0x26314a),
  sunColor: new THREE.Color(0x9fb4e6), sunIntensity: 0.9,   // 月明かり
  hemiSky: new THREE.Color(0x7088bd), hemiGround: new THREE.Color(0x2a2633), hemiIntensity: 1.2,
  firefly: new THREE.Color(0.75, 1.25, 0.55),
  cloud: new THREE.Color(0x3a4566),
};
const DAY = {
  sun: sunDir.clone(), fog: scene.fog.color.clone(), sunColor: sunLight.color.clone(), sunIntensity: sunLight.intensity,
  hemiSky: hemiLight.color.clone(), hemiGround: hemiLight.groundColor.clone(), hemiIntensity: hemiLight.intensity,
  fill: fillLight.intensity, lakeTint: lakeTint.material.opacity,
};
// 夜の側にだけあるもの（村・星・月）は、夜の深さに合わせて浮かび上がる
const nightOnly = [];
mirrorWorld.traverse((o) => {
  if (o.material && !nightOnly.some(([m]) => m === o.material)) {
    o.material.transparent = true;
    nightOnly.push([o.material, o.material.opacity]);
  }
});
let elapsed = 0, worldNight = 0, clockRunning = false, clockTime = 0;
const lerp = THREE.MathUtils.lerp;

function applyWorld(k, inWater) {
  mirrorWorld.visible = k > 0.001;
  for (const [mat, base] of nightOnly) mat.opacity = base * k;
  su.sunPosition.value.copy(DAY.sun).lerp(NIGHT.sun, k).normalize();
  scene.fog.color.copy(DAY.fog).lerp(NIGHT.fog, k);
  sunLight.color.copy(DAY.sunColor).lerp(NIGHT.sunColor, k);
  sunLight.intensity = lerp(DAY.sunIntensity, NIGHT.sunIntensity, k);
  fillLight.intensity = lerp(DAY.fill, 0, k);
  hemiLight.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, k);
  hemiLight.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, k);
  hemiLight.intensity = lerp(DAY.hemiIntensity, NIGHT.hemiIntensity, k);
  moteMat.color.setRGB(1, 1, 1).lerp(NIGHT.firefly, k);
  moteMat.size = lerp(1.6, 2.4, k);
  moteMat.opacity = lerp(0.7, 0.9, k);
  faceMat.emissiveIntensity = lerp(0.25, 1.6, k);
  for (const c of clouds) { c.mat.color.copy(c.day).lerp(NIGHT.cloud, k); c.mat.opacity = lerp(c.dayOpacity, 0.5, k); }
  lakeTint.material.opacity = DAY.lakeTint * (1 - k);
  // 水の中では、時計はずっと動いている。こちらでは鐘が鳴るまで止まったまま
  const minute = inWater ? -elapsed * 0.05 : -1.2 - clockTime * 0.05;
  minuteHand.rotation.z = minute;
  hourHand.rotation.z = inWater ? minute / 12 : -clockTime * 0.05 / 12;
  clockFace.updateMatrixWorld(true);
}
const renderReflection = lake.onBeforeRender;
lake.onBeforeRender = function (...args) {
  applyWorld(1, true);
  renderReflection.apply(this, args);
  applyWorld(worldNight, false);
};

// 砂浜に置き忘れられた傘
const UMBRELLA_ANGLE = 1.2;
const umbrellaX = LAKE.x + Math.cos(UMBRELLA_ANGLE) * LAKE.r * 0.97;
const umbrellaZ = LAKE.z + Math.sin(UMBRELLA_ANGLE) * LAKE.r * 0.97;
const umbrella = new THREE.Group();
const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 5), woodMat);
umbrellaPole.position.y = 2;
const canopy = new THREE.Mesh(
  new THREE.ConeGeometry(3.2, 1.8, 10, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xa4524a, roughness: 0.8, side: THREE.DoubleSide })
);
canopy.position.y = 3.6;
umbrella.add(umbrellaPole, canopy);
umbrella.position.set(umbrellaX, Math.max(heightAt(umbrellaX, umbrellaZ), CFG.lakeLevel), umbrellaZ);
umbrella.rotation.set(0.25, 0.8, 0.1);
umbrella.scale.setScalar(0.6);  // 子どもの傘の大きさ
umbrella.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
relics.add(umbrella);

// ---------- 妖精（この谷にただ一匹。WASD／矢印で飛ぶ） ----------
const fairy = new THREE.Group();
const fairyBody = new THREE.Group();
fairy.add(fairyBody);
const dress = new THREE.Mesh(
  new THREE.ConeGeometry(0.22, 0.55, 12).translate(0, 0.28, 0),
  new THREE.MeshStandardMaterial({ color: 0xe4f4ff, emissive: 0x8fd0ff, emissiveIntensity: 0.9, roughness: 0.6 })
);
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.15, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xffe6d2, emissive: 0xffd2b0, emissiveIntensity: 0.5 })
);
head.position.y = 0.66;
const hair = new THREE.Mesh(
  new THREE.SphereGeometry(0.165, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6),
  new THREE.MeshStandardMaterial({ color: 0xf6dc8a, emissive: 0xc9a040, emissiveIntensity: 0.6 })
);
hair.position.set(0, 0.68, -0.02);
hair.rotation.x = -0.35;
fairyBody.add(dress, head, hair);

// 羽：細長い楕円を二枚ずつ、背中から生やす
const wingShape = new THREE.Shape();
wingShape.absellipse(0.32, 0, 0.34, 0.14, 0, Math.PI * 2);
const wingMat = new THREE.MeshBasicMaterial({
  color: 0xbfeaff, transparent: true, opacity: 0.45, side: THREE.DoubleSide,
  depthWrite: false, blending: THREE.AdditiveBlending,
});
const wings = [];
for (const side of [1, -1]) {
  for (const [tilt, size] of [[0.45, 1], [-0.35, 0.7]]) {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.48, -0.08);
    const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat);
    wing.scale.set(side * size, size, 1);
    wing.rotation.z = side * tilt;
    pivot.add(wing);
    fairyBody.add(pivot);
    wings.push({ pivot, side });
  }
}

const fairyHalo = haloSprite(0xbfe6ff, 4.5, 0.8);
fairyHalo.position.y = 0.45;
const fairyCore = haloSprite(0xffffff, 0.9, 0.9);
fairyCore.position.y = 0.45;
const fairyLight = new THREE.PointLight(0xbfe4ff, 6, 18, 2);
fairyLight.position.y = 0.5;
fairy.add(fairyHalo, fairyCore, fairyLight);

const fairyStart = new THREE.Vector3().lerpVectors(camera.position, controls.target, 0.22);
fairyStart.y = heightAt(fairyStart.x, fairyStart.z) + 3;
fairy.position.copy(fairyStart);
scene.add(fairy);

// 通ったあとに残る光の粉
const DUST = 260;
const dustPos = new Float32Array(DUST * 3), dustCol = new Float32Array(DUST * 3);
const dustLife = new Float32Array(DUST), dustVel = new Float32Array(DUST * 3);
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));
scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
  map: glowTex, vertexColors: true, size: 0.5, transparent: true,
  blending: THREE.AdditiveBlending, depthWrite: false,
})));
let dustNext = 0, dustTimer = 0;
const dustTint = new THREE.Color(0xd8f2ff);

// 入力：キーボードと、タッチ端末用の画面上のパッド
const keys = new Set();
const KEYMAP = {
  KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'up', KeyE: 'up', ShiftLeft: 'down', ShiftRight: 'down', KeyQ: 'down',
};
addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  keys.add(k);
});
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
addEventListener('blur', () => keys.clear());
document.querySelectorAll('#pad [data-k]').forEach((btn) => {
  const k = btn.dataset.k;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation(); // 視点のドラッグと混ざらないように
    try { btn.setPointerCapture(e.pointerId); } catch { /* 指がすでに離れている */ }
    keys.add(k);
    btn.classList.add('held');
    startAudio();
  });
  const release = () => { keys.delete(k); btn.classList.remove('held'); };
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) btn.addEventListener(ev, release);
});
// 長押しでメニューや文字選択が出ないように
document.getElementById('pad').addEventListener('contextmenu', (e) => e.preventDefault());

const fairyVel = new THREE.Vector3();
const camFwd = new THREE.Vector3(), camRight = new THREE.Vector3(), wish = new THREE.Vector3();
const prevTarget = new THREE.Vector3();
let following = false, zoomIn = false;
let followDist = 22;

function updateFairy(t, dt) {
  // カメラの向きを基準に、前後左右を決める
  camera.getWorldDirection(camFwd);
  camFwd.y = 0; camFwd.normalize();
  camRight.crossVectors(camFwd, camera.up).normalize();
  wish.set(0, 0, 0);
  if (keys.has('fwd')) wish.add(camFwd);
  if (keys.has('back')) wish.sub(camFwd);
  if (keys.has('right')) wish.add(camRight);
  if (keys.has('left')) wish.sub(camRight);
  if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(22);
  if (keys.has('up')) wish.y += 12;
  if (keys.has('down')) wish.y -= 12;

  // 場面のあいだは、妖精はひとりでに動く（行き先がなければ、その場に浮かぶ）
  const autopilot = inScene();
  if (autopilot) {
    const goal = director.shots ? director.fairyGoal : fairyGoal;
    if (goal) {
      wish.copy(goal).sub(fairy.position).multiplyScalar(1.2);
      if (wish.length() > 16) wish.setLength(16);
    } else {
      wish.set(0, 0, 0);
    }
  } else if (keys.size) {
    controls.autoRotate = false;
    lastTouch = t;
    if (!following) { following = true; zoomIn = true; }
  }

  fairyVel.lerp(wish, 1 - Math.exp(-dt * 3));
  fairy.position.addScaledVector(fairyVel, dt);

  // 地面（湖面）すれすれより下、空の高すぎる所、谷の外へは出ない
  const ground = Math.max(heightAt(fairy.position.x, fairy.position.z), CFG.lakeLevel) + 0.8;
  fairy.position.y = THREE.MathUtils.clamp(fairy.position.y, ground, 140);
  fairy.position.x = THREE.MathUtils.clamp(fairy.position.x, -600, 600);
  fairy.position.z = THREE.MathUtils.clamp(fairy.position.z, -600, 600);

  // 進む向きへ体を向け、速さに応じて少し前に傾く
  const speed = Math.hypot(fairyVel.x, fairyVel.z);
  if (speed > 0.5) {
    const yaw = Math.atan2(fairyVel.x, fairyVel.z);
    let dy = yaw - fairy.rotation.y;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    fairy.rotation.y += dy * (1 - Math.exp(-dt * 6));
  }
  fairyBody.rotation.x = THREE.MathUtils.lerp(fairyBody.rotation.x, Math.min(speed / 22, 1) * 0.5, 1 - Math.exp(-dt * 4));
  fairyBody.position.y = Math.sin(t * 2.2) * 0.12;

  // はばたき：速く飛ぶほど速く
  const flap = Math.sin(t * (14 + speed * 0.6)) * 0.6;
  for (const w of wings) w.pivot.rotation.y = w.side * (0.35 + flap);
  fairyHalo.material.opacity = 0.7 + Math.sin(t * 3.1) * 0.1;

  // 光の粉をこぼす
  dustTimer += dt * (6 + speed * 1.5);
  while (dustTimer > 1) {
    dustTimer -= 1;
    const i = dustNext; dustNext = (dustNext + 1) % DUST;
    dustPos[i * 3] = fairy.position.x + (Math.random() - 0.5) * 0.3;
    dustPos[i * 3 + 1] = fairy.position.y + fairyBody.position.y + 0.4;
    dustPos[i * 3 + 2] = fairy.position.z + (Math.random() - 0.5) * 0.3;
    dustVel[i * 3] = (Math.random() - 0.5) * 0.4;
    dustVel[i * 3 + 1] = -0.3 - Math.random() * 0.4;
    dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    dustLife[i] = 1;
  }
  for (let i = 0; i < DUST; i++) {
    if (dustLife[i] <= 0) continue;
    dustLife[i] = Math.max(dustLife[i] - dt * 0.6, 0);
    for (let k = 0; k < 3; k++) dustPos[i * 3 + k] += dustVel[i * 3 + k] * dt;
    const l = dustLife[i] * dustLife[i];
    dustCol[i * 3] = dustTint.r * l; dustCol[i * 3 + 1] = dustTint.g * l; dustCol[i * 3 + 2] = dustTint.b * l;
  }
  dustGeo.attributes.position.needsUpdate = true;
  dustGeo.attributes.color.needsUpdate = true;

  // 動かしはじめたら、カメラは妖精を追いかける（回転・ズームは自由なまま）
  if (following && !autopilot) {
    prevTarget.copy(controls.target);
    controls.target.lerp(fairy.position, 1 - Math.exp(-dt * 4));
    camera.position.add(prevTarget.sub(controls.target).negate());
    if (zoomIn) {
      const off = camera.position.clone().sub(controls.target);
      const d = off.length();
      const nd = THREE.MathUtils.lerp(d, followDist, 1 - Math.exp(-dt * 1.5));
      camera.position.copy(controls.target).addScaledVector(off.normalize(), nd);
      if (Math.abs(nd - followDist) < 0.5) zoomIn = false;
    }
  }
}
controls.addEventListener('start', () => { zoomIn = false; }); // ホイールやドラッグを優先する

// ---------- 物語：記憶のかけらと、鳴らない鐘 ----------
const storyEl = document.getElementById('story');
const progressEl = document.getElementById('progress');
const lines = [];
let speaking = false;
// 文を順に一つずつ浮かべる。関数を混ぜると、その順番で実行される
// 妖精自身のことばは fairy_()、あの子のことばは child_() で包むと色が変わる
const fairy_ = (text) => ({ text, voice: 'fairy' });
const child_ = (text) => ({ text, voice: 'child' });
function narrate(...items) {
  lines.push(...items);
  if (!speaking) nextLine();
}
function nextLine() {
  const item = lines.shift();
  if (item === undefined) { speaking = false; return; }
  if (typeof item === 'function') { item(); nextLine(); return; }
  const { text, voice } = typeof item === 'string' ? { text: item } : item;
  speaking = true;
  storyEl.textContent = text;
  storyEl.classList.toggle('fairy', voice === 'fairy');
  storyEl.classList.toggle('child', voice === 'child');
  storyEl.classList.add('on');
  setTimeout(() => {
    storyEl.classList.remove('on');
    setTimeout(nextLine, 1400);
  }, 2600 + text.length * S.perChar);
}

const nearestLantern = flames.reduce((a, b) => (a.pos.distanceTo(fairyStart) < b.pos.distanceTo(fairyStart) ? a : b));
const ruinSite = VILLAGE[3];
const millFront = new THREE.Vector3(LAKE.x - millX, 0, LAKE.z - millZ).normalize().multiplyScalar(7);
let millSpeed = 0, millTarget = 0;

const MEMORIES = [
  {
    pos: nearestLantern.pos.clone().add(new THREE.Vector3(0, 3.5, 0)),
    text: [
      S.lanternA, S.lanternB,
      fairy_(S.lanternF),
    ],
  },
  {
    pos: umbrella.position.clone().add(new THREE.Vector3(0, 6, 0)),
    text: [
      S.umbrellaA, S.umbrellaB,
      fairy_(S.umbrellaF),
    ],
  },
  {
    pos: new THREE.Vector3(ruinSite.x, heightAt(ruinSite.x, ruinSite.z) + 3, ruinSite.z),
    text: [
      S.bakeryA, S.bakeryB,
      fairy_(S.bakeryF),
    ],
  },
  {
    pos: mill.position.clone().add(millFront).add(new THREE.Vector3(0, 4, 0)),
    text: [
      S.millA, () => { millTarget = 0.35; }, S.millB,
      fairy_(S.millF),
    ],
  },
];

const beamGeo = new THREE.CylinderGeometry(0.25, 0.7, 70, 10, 1, true).translate(0, 35, 0);
function lightBeam(color, opacity) {
  return new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, fog: false, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
}
const orbs = MEMORIES.map((m) => {
  const group = new THREE.Group();
  const glow = haloSprite(0xffe8b8, 6, 0.8);
  const core = haloSprite(0xffffff, 1.6, 1);
  const beam = lightBeam(0xffe2a8, 0.1);
  group.add(glow, core, beam);
  group.position.copy(m.pos);
  scene.add(group);
  return { ...m, memory: m, group, glow, beam, state: 'idle', t: 0 };
});

// 鐘楼：すべてのかけらが揃うと、鐘へ導く光が立つ
const bellWorld = tower.position.clone().add(new THREE.Vector3(0, 30.5, 0));
const towerBeam = lightBeam(0xffd27a, 0);
towerBeam.position.copy(bellWorld);
scene.add(towerBeam);

let found = 0, bellReady = false, bellRung = false, lastRefusal = -99, bellSwing = 0, nightProgress = 0;
function showProgress() {
  progressEl.innerHTML = S.progress + MEMORIES.map((_, i) => (i < found ? '<b>●</b>' : '○')).join('');
}
showProgress();

function collect(o) {
  o.state = 'flying';
  found++;
  showProgress();
  audio?.chime(found - 1);
  // かけらを抱くたび、妖精の光が少し強く、あたたかくなる
  fairyLight.intensity += 1.5;
  fairyHalo.scale.addScalar(0.5);
  dustTint.lerp(new THREE.Color(0xffe2a8), 0.25);
  hush();
  playMemory(o);
}

function ringTheBell() {
  bellRung = true;
  bellSwing = 0.6;
  clockRunning = true;
  audio?.bellClear();
  setTimeout(() => audio?.nightfall(), 3500);
  progressEl.style.opacity = 0;
  hush();
  narrate(
    S.bell1,
    fairy_(S.bell2),
    fairy_(S.bell3),
    S.bell4,
    fairy_(S.bell5),
    release,
  );
  const a0 = Math.atan2(camera.position.x - bellWorld.x, camera.position.z - bellWorld.z);
  playShots([
    // 揺れる鐘に寄る
    {
      cut: true, dur: 6.5,
      cam: (t, out) => {
        const a = a0 + t * 0.06;
        out.pos.set(bellWorld.x + Math.sin(a) * 9, bellWorld.y - 1.5, bellWorld.z + Math.cos(a) * 9);
        out.look.copy(bellWorld);
      },
    },
    // 谷の上空から、夜が降りてくるのを見わたす
    { cut: true, dur: null, tail: 1, cam: orbit(V(LAKE.x, 10, LAKE.z), 140, 80, a0, 0.02, 45) },
  ], () => startEnding());
}

function updateStory(t, dt) {
  for (const o of orbs) {
    if (o.state === 'idle') {
      o.group.position.y = o.pos.y + Math.sin(t * 1.5 + o.pos.x) * 0.4;
      o.glow.material.opacity = 0.6 + Math.sin(t * 2 + o.pos.z) * 0.2;
      if (!inScene() && fairy.position.distanceTo(o.group.position) < 4.5) collect(o);
    } else if (o.state === 'flying') {
      // 妖精の胸へ吸いこまれていく
      o.t += dt / 0.9;
      o.group.position.lerp(fairy.position, 1 - Math.exp(-dt * 8));
      o.group.scale.setScalar(Math.max(1 - o.t, 0.01));
      o.beam.material.opacity = 0.1 * Math.max(1 - o.t * 2, 0);
      if (o.t >= 1) { o.state = 'done'; scene.remove(o.group); }
    }
  }

  const nearBell = !inScene() && fairy.position.distanceTo(bellWorld) < 7;
  if (bellReady && !bellRung) {
    towerBeam.material.opacity = 0.14 + Math.sin(t * 2) * 0.05;
    if (nearBell) ringTheBell();
  } else {
    towerBeam.material.opacity = Math.max(towerBeam.material.opacity - dt * 0.1, 0);
    if (!bellReady && nearBell && t - lastRefusal > 15) {
      lastRefusal = t;
      narrate(S.refuse1, S.refuse2);
    }
  }

  // 鐘の揺れ、時計、夜の訪れ
  bell.rotation.z = Math.sin(t * 3.2) * bellSwing;
  bellSwing *= Math.exp(-dt * 0.25);
  if (clockRunning) clockTime += dt;
  if (bellRung && nightProgress < 1) {
    nightProgress = Math.min(nightProgress + dt / 26, 1);
    worldNight = THREE.MathUtils.smootherstep(nightProgress, 0, 1);
  }
  millSpeed = lerp(millSpeed, millTarget, 1 - Math.exp(-dt * 0.5));
  sails.rotation.z -= millSpeed * dt;
}

// ---------- 結末：水の底の夜から、あの子が傘を取りに来る ----------
// 人の姿：あの子にも、回想に出てくる光る人影にも使う。腕は肩を支点に回す
function makeFigure(m, scale = 1) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const legs = [-0.12, 0.12].map((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6).translate(0, -0.2, 0), m.skin);
    leg.position.set(x, 0.4, 0);
    body.add(leg);
    return leg;
  });
  const dress = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 12).translate(0, 0.47, 0), m.dress);
  dress.position.y = 0.35;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), m.skin);
  head.position.y = 1.55;
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), m.hair);
  hair.position.set(0, 1.58, -0.03);
  hair.rotation.x = -0.3;
  body.add(dress, head, hair);
  if (m.eye) {
    for (const x of [-0.085, 0.085]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), m.eye);
      eye.position.set(x, 1.57, 0.235);
      body.add(eye);
    }
  }
  const [armL, armR] = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.24, 1.22, 0);
    pivot.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1).translate(0, -0.27, 0), m.skin));
    body.add(pivot);
    return pivot;
  });
  root.scale.setScalar(scale);
  return { root, body, legs, armL, armR };
}

const kidMats = [];
const kidMat = (opts) => {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.8, transparent: true, opacity: 0, ...opts });
  kidMats.push(m);
  return m;
};
// 右手で傘を、左手で小さな灯りを持つ
const kidFig = makeFigure({
  dress: kidMat({ color: 0xf0e4cf, emissive: 0x3a3428 }),
  skin: kidMat({ color: 0xf6d7bf, emissive: 0x4a3426 }),
  hair: kidMat({ color: 0x4a3426 }),
  eye: kidMat({ color: 0x2a1c14, roughness: 0.4 }),
});
const kid = kidFig.root, kidBody = kidFig.body, kidLegs = kidFig.legs;
const kidLeftArm = kidFig.armL, kidRightArm = kidFig.armR;
const kidLamp = new THREE.Group();
kidLamp.position.set(0, -0.6, 0.05);
const kidLampGlass = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8),
  new THREE.MeshStandardMaterial({ color: 0xffe6bf, emissive: 0xffa04a, emissiveIntensity: 3, transparent: true, opacity: 0 }));
kidMats.push(kidLampGlass.material);
const kidLampHalo = haloSprite(0xffb46a, 3.5, 0);
const kidLampLight = new THREE.PointLight(0xffb36b, 0, 14, 2);
kidLamp.add(kidLampGlass, kidLampHalo, kidLampLight);
kidLeftArm.add(kidLamp);
kid.visible = false;
scene.add(kid);

const lakeCenter = new THREE.Vector3(LAKE.x, CFG.lakeLevel, LAKE.z);
const kidStart = new THREE.Vector3(
  LAKE.x + Math.cos(UMBRELLA_ANGLE) * LAKE.r * 0.4, CFG.lakeLevel, LAKE.z + Math.sin(UMBRELLA_ANGLE) * LAKE.r * 0.4);
const kidEnd = new THREE.Vector3(
  LAKE.x + Math.cos(UMBRELLA_ANGLE) * LAKE.r * 0.92, 0, LAKE.z + Math.sin(UMBRELLA_ANGLE) * LAKE.r * 0.92);
const umbrellaGrip = new THREE.Vector3();
const ending = { phase: 'none', t: 0, holding: false, waving: false, a0: 0 };
const camGoal = new THREE.Vector3(), targetGoal = new THREE.Vector3(), fairyGoal = new THREE.Vector3();
const titleEl = document.getElementById('title');

function startEnding() {
  ending.phase = 'arrive';
  ending.t = 0;
  kid.visible = true;
  kid.position.copy(kidStart);
  kid.rotation.y = Math.atan2(kidEnd.x - kidStart.x, kidEnd.z - kidStart.z);
  controls.enabled = false;
  controls.autoRotate = false;
  keys.clear();
}

function showTitle(sub, ms) {
  document.getElementById('title-sub').textContent = sub;
  titleEl.classList.add('on');
  setTimeout(() => titleEl.classList.remove('on'), ms);
}

const creditsEl = document.getElementById('credits');
function rollCredits() {
  creditsEl.classList.add('on');
  creditsEl.querySelector('.roll').addEventListener('animationend', finishEnding, { once: true });
}

function finishEnding() {
  ending.phase = 'after';
  creditsEl.classList.remove('on');
  cinema(false);
  // 谷を見わたす眺めのまま手を離す。また飛ばしはじめたら、妖精を追いかける
  following = false; followDist = 22;
  lastTouch = elapsed;
  narrate(S.afterEnd);
}

function updateEnding(t, dt) {
  if (ending.phase === 'none') return;
  ending.t += dt;
  const out = kid.position.clone().sub(lakeCenter).setY(0).normalize();  // 湖から岸へ向かう向き
  const side = new THREE.Vector3(out.z, 0, -out.x);

  // あの子：水面に浮かび上がり、岸の傘まで歩いていく
  const fade = Math.min(ending.t / 3, 1);
  for (const m of kidMats) m.opacity = fade;
  kidLampHalo.material.opacity = 0.8 * fade;
  kidLampLight.intensity = 5 * fade;
  if (ending.phase === 'arrive' && ending.t > 3) ending.phase = 'walk';
  if (ending.phase === 'walk') {
    const p = Math.min((ending.t - 3) / 14, 1);
    kid.position.lerpVectors(kidStart, kidEnd, p);
    const step = Math.sin(ending.t * 7);
    kidLegs[0].rotation.x = step * 0.5;
    kidLegs[1].rotation.x = -step * 0.5;
    kidRightArm.rotation.x = -step * 0.3;
    kidBody.position.y = Math.abs(step) * 0.05;
    if (p >= 1) {
      ending.phase = 'promise';
      ending.holding = true;
      kidLegs.forEach((l) => { l.rotation.x = 0; });
      audio?.motif(true);
      narrate(
        child_(S.kid1),
        () => { ending.waving = true; },
        child_(S.kid2),
        fairy_(S.kid3),
        () => {
          ending.phase = 'wide';
          ending.a0 = Math.atan2(camera.position.x - LAKE.x, camera.position.z - LAKE.z);
          ending.wideT = ending.t;
        },
        S.nightCame,
        () => {
          showTitle(S.theEnd, 8000);
          audio?.motif();
          setTimeout(rollCredits, 9500);
        },
      );
    }
  }
  kid.position.y = Math.max(heightAt(kid.position.x, kid.position.z), CFG.lakeLevel) + 0.02;

  // 傘を拾ったら、妖精のほうへ向き直り、灯りを振る
  if (ending.holding) {
    const toFairy = Math.atan2(fairy.position.x - kid.position.x, fairy.position.z - kid.position.z);
    let dy = toFairy - kid.rotation.y;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    kid.rotation.y += dy * (1 - Math.exp(-dt * 2));
    // 傘は閉じて、肩にもたせかけるように持つ
    kidRightArm.rotation.set(-0.5, 0, 0.1);
    umbrellaGrip.set(0.3, 0.75, 0.25).applyAxisAngle(THREE.Object3D.DEFAULT_UP, kid.rotation.y).add(kid.position);
    umbrella.position.copy(umbrellaGrip);
    umbrella.rotation.set(0, kid.rotation.y, -0.35);
    umbrella.scale.setScalar(0.45);
    canopy.scale.set(0.18, 1.5, 0.18);
  }
  const wave = ending.waving || (ending.phase === 'after' && fairy.position.distanceTo(kid.position) < 10);
  kidLeftArm.rotation.z = lerp(kidLeftArm.rotation.z, wave ? -2.4 + Math.sin(t * 6) * 0.35 : 0, 1 - Math.exp(-dt * 5));

  // 妖精は、あの子のそばへ飛んでいく
  // （岸に着いたら湖の側へまわり、あの子がこちらを向くように）
  if (ending.phase !== 'after') {
    if (ending.phase === 'promise') fairyGoal.copy(kid.position).addScaledVector(out, -3).addScaledVector(side, -1.6);
    else fairyGoal.copy(kid.position).addScaledVector(side, 2.2).addScaledVector(out, 0.8);
    fairyGoal.y = kid.position.y + 2.2;
  }

  // カメラ：はじめはあの子に寄り、最後は谷全体を見わたしながらゆっくり巡る
  if (ending.phase === 'after') return;
  const k = 1 - Math.exp(-dt * 0.9);
  if (ending.phase === 'wide') {
    const a = ending.a0 + (ending.t - ending.wideT) * 0.035;
    targetGoal.set(LAKE.x, 8, LAKE.z);
    camGoal.set(LAKE.x + Math.sin(a) * 120, 0, LAKE.z + Math.cos(a) * 120);
    camGoal.y = Math.max(85, heightAt(camGoal.x, camGoal.z) + 45);  // 木々より高く
  } else if (ending.phase === 'promise') {
    // 岸に着いたら、湖の上から、あの子と妖精を正面に近く見る
    targetGoal.copy(kid.position).y += 1.6;
    camGoal.copy(kid.position).addScaledVector(out, -8).addScaledVector(side, 2.5);
    camGoal.y = kid.position.y + 3;
  } else {
    // 水の上を歩くあいだは、岸の高いところから、あの子と向こうの村を見下ろす
    targetGoal.copy(kid.position).y += 1.2;
    camGoal.copy(kid.position).addScaledVector(out, 12).addScaledVector(side, -4);
    camGoal.y = Math.max(kid.position.y + 8, heightAt(camGoal.x, camGoal.z) + 7);
  }
  controls.target.lerp(targetGoal, k);
  camera.position.lerp(camGoal, k);
}

// ---------- 演出：短い映画のように撮る ----------
// 場面（shot）を順に流す。dur が null の場面は、release() が呼ばれてから tail 秒で終わる。
// cut: true の場面は暗転から切り替わり、chase があればカメラはその速さで目標を追う
const director = { shots: null, i: 0, t: 0, tailT: null, released: false, onDone: null, fairyGoal: null };
const skipBtn = document.getElementById('skip');
const fadeEl = document.getElementById('fade');
const camWant = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
const inScene = () => director.shots !== null || (ending.phase !== 'none' && ending.phase !== 'after');

function cinema(on) {
  document.body.classList.toggle('cinema', on);
  controls.enabled = !on;
  if (on) { controls.autoRotate = false; keys.clear(); }
}
function dipToBlack() {
  fadeEl.classList.add('on');
  setTimeout(() => fadeEl.classList.remove('on'), 40);
}
function hush() {
  lines.length = 0;
  storyEl.classList.remove('on');
}
function release() { director.released = true; }

function playShots(shots, onDone, { skippable = false } = {}) {
  cinema(true);
  Object.assign(director, { shots, i: 0, released: false, onDone, fairyGoal: null });
  skipBtn.hidden = !skippable;
  beginShot();
}
function beginShot() {
  const s = director.shots[director.i];
  director.t = 0;
  director.tailT = null;
  s.enter?.();
  if (s.cut) {
    dipToBlack();
    s.cam(0, camWant);
    camera.position.copy(camWant.pos);
    controls.target.copy(camWant.look);
  }
}
function finishShots() {
  const done = director.onDone;
  director.shots = null;
  skipBtn.hidden = true;
  done?.();
}
skipBtn.addEventListener('click', () => {
  if (!director.shots) return;
  hush();
  director.shots[director.i].exit?.();
  dipToBlack();
  finishShots();
});
// 場面の入り（1.6 秒で浮かぶ）と終わり（tail のあいだに消える）の濃さ
function shotFade(t, tail) {
  const fin = Math.min(t / 1.6, 1);
  const fout = director.tailT === null ? 1 : Math.max(0, 1 - (t - director.tailT) / tail);
  return fin * fout;
}
function updateDirector(dt) {
  if (!director.shots) return;
  const s = director.shots[director.i];
  director.t += dt;
  s.cam(director.t, camWant);
  const k = s.chase ? 1 - Math.exp(-dt * s.chase) : 1;
  camera.position.lerp(camWant.pos, k);
  controls.target.lerp(camWant.look, k);
  s.update?.(director.t, dt);
  let over = s.dur != null && director.t >= s.dur;
  if (s.dur == null && director.released) {
    if (director.tailT === null) director.tailT = director.t;
    over = director.t - director.tailT >= (s.tail ?? 1.5);
  }
  if (!over) return;
  s.exit?.();
  if (++director.i < director.shots.length) beginShot();
  else finishShots();
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = (p) => THREE.MathUtils.smootherstep(p, 0, 1);
const groundY = (x, z) => Math.max(heightAt(x, z), CFG.lakeLevel);
const faceTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
// from から to へ、dur 秒かけてゆっくり動くカメラ
function dolly(from, to, lookFrom, lookTo, dur) {
  return (t, out) => {
    const p = ease(Math.min(t / dur, 1));
    out.pos.lerpVectors(from, to, p);
    out.look.lerpVectors(lookFrom, lookTo, p);
  };
}
// center のまわりを、半径 radius・高さ height でゆっくり巡るカメラ（地面からは clear 以上離す）
function orbit(center, radius, height, a0, speed, clear = 4) {
  return (t, out) => {
    const a = a0 + t * speed;
    out.pos.set(center.x + Math.sin(a) * radius, 0, center.z + Math.cos(a) * radius);
    out.pos.y = Math.max(center.y + height, heightAt(out.pos.x, out.pos.z) + clear);
    out.look.copy(center);
  };
}

// ---- 幕開け ----
const PLAY_VIEW = { pos: camera.position.clone(), look: controls.target.clone() };
const PROLOGUE = [
  // 空の高みから、黄昏の谷を見下ろす
  { cut: true, dur: 11, cam: dolly(V(-430, 240, 430), V(-300, 160, 300), V(-40, 40, 0), V(-40, 18, 0), 11) },
  // 湖へ降りていき、水の底の夜をのぞきこむ
  { cut: true, dur: null, tail: 1.5, cam: dolly(V(-150, 26, 125), V(-100, 13, 85), V(-40, 4, 30), V(-25, -30, -5), 15) },
  // 草原に浮かぶ、ひとりの妖精
  {
    cut: true, dur: 8,
    cam: (t, out) => {
      const a = 2.3 + t * 0.07;
      out.pos.set(fairy.position.x + Math.sin(a) * 5, fairy.position.y + 1.1, fairy.position.z + Math.cos(a) * 5);
      out.look.copy(fairy.position).y += 0.45;
    },
    enter: () => showTitle('', 6500),
  },
  // いつもの眺めへ
  { dur: 4, chase: 1.6, cam: (t, out) => { out.pos.copy(PLAY_VIEW.pos); out.look.copy(PLAY_VIEW.look); } },
];
function beginStory() {
  playShots(PROLOGUE, () => {
    cinema(false);
    lastTouch = elapsed;
    narrate(S.intro1, S.intro2);
  }, { skippable: true });
  narrate(
    S.pro1,
    S.pro2,
    S.pro3,
    S.pro4,
    release,
  );
  setTimeout(() => audio?.motif(), 1500);
}
// 「はじめる」：音を出す許可もこのとき得る
const startEl = document.getElementById('start');
document.getElementById('begin').addEventListener('click', () => {
  startAudio();
  startEl.classList.add('gone');
  beginStory();
}, { once: true });
// 幕が上がる前から、最初の場面の位置で待っておく
PROLOGUE[0].cam(0, camWant);
camera.position.copy(camWant.pos);
controls.target.copy(camWant.look);
document.body.classList.add('cinema');
controls.enabled = false;

// ---- 回想：かけらを拾うと、その場所の記憶が光る人影になって浮かぶ ----
function makeGhost(scale = 1) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffe7c2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const f = makeFigure({ skin: mat, dress: mat, hair: mat }, scale);
  const glow = haloSprite(0xffd9a0, 3.2, 0);
  glow.position.y = 1;
  f.body.add(glow);
  f.fade = (a) => { mat.opacity = 0.5 * a; glow.material.opacity = 0.3 * a; };
  f.place = (p, face) => { f.root.position.set(p.x, groundY(p.x, p.z), p.z); f.root.rotation.y = face; };
  scene.add(f.root);
  return f;
}
// むかしの妖精：小さな青白い光
function makeSpark() {
  const s = haloSprite(0xd8f0ff, 1.6, 0);
  scene.add(s);
  return s;
}
const dirFromLake = (p) => V(p.x - LAKE.x, 0, p.z - LAKE.z).normalize();
const sideOf = (d) => V(d.z, 0, -d.x);

MEMORIES[0].vignette = () => {
  // 灯籠に火を入れる子どもたち
  const base = nearestLantern.pos.clone();
  base.y = groundY(base.x, base.z);
  const out = dirFromLake(base), side = sideOf(out);
  const a = makeGhost(), b = makeGhost(0.85), s = makeSpark();
  const pa = base.clone().addScaledVector(side, 1).addScaledVector(out, 0.5);
  const pb = base.clone().addScaledVector(side, -1.4).addScaledVector(out, 1.4);
  a.place(pa, faceTo(pa, base));
  b.place(pb, faceTo(pb, pa));
  const by = b.root.position.y;
  return {
    center: base.clone().setY(base.y + 1.6), radius: 12, height: 3, a0: Math.atan2(-out.x, -out.z),
    update(t, f) {
      a.fade(f); b.fade(f); s.material.opacity = 0.9 * f;
      a.armR.rotation.x = -2.5 + Math.sin(t * 1.5) * 0.15;
      b.root.position.y = by + Math.abs(Math.sin(t * 3.2)) * 0.3;
      b.armL.rotation.z = -2.2 + Math.sin(t * 6) * 0.3;
      s.position.set(base.x + Math.cos(t * 1.3) * 1.4, base.y + 2.6 + Math.sin(t * 2.6) * 0.25, base.z + Math.sin(t * 1.3) * 1.4);
    },
    dispose() { scene.remove(a.root, b.root, s); },
  };
};

MEMORIES[1].vignette = () => {
  // 「あした、取りに来るね」と手を振って、帰っていくあの子
  const base = umbrella.position.clone();
  const out = dirFromLake(base), side = sideOf(out);
  const g = makeGhost(), s = makeSpark();
  const start = base.clone().addScaledVector(side, 0.9);
  const sp = base.clone().addScaledVector(side, -0.9).addScaledVector(out, -0.4);
  sp.y = groundY(sp.x, sp.z) + 1.8;
  return {
    center: base.clone().setY(base.y + 1.2), radius: 13, height: 3.5, a0: Math.atan2(-out.x, -out.z) - 0.5,
    update(t, f) {
      const leave = Math.max(0, t - 6);
      const p = start.clone().addScaledVector(out, leave * 0.9);
      g.place(p, leave > 0 ? faceTo(base, base.clone().add(out)) : faceTo(start, sp));
      g.fade(f * Math.max(0, 1 - leave / 9));
      g.armL.rotation.z = leave > 0 ? 0 : -2.3 + Math.sin(t * 6) * 0.35;
      const step = leave > 0 ? Math.sin(t * 7) * 0.5 : 0;
      g.legs[0].rotation.x = step; g.legs[1].rotation.x = -step;
      s.material.opacity = 0.9 * f;
      s.position.copy(sp).y += Math.sin(t * 2) * 0.15;
    },
    dispose() { scene.remove(g.root, s); },
  };
};

MEMORIES[2].vignette = () => {
  // パン屋の戸口で、パンのかけらを受け取り、妖精に分けるあの子
  const base = new THREE.Vector3(ruinSite.x, 0, ruinSite.z);
  base.y = groundY(base.x, base.z);
  const face = Math.atan2(LAKE.x - base.x, LAKE.z - base.z);
  const fwd = V(Math.sin(face), 0, Math.cos(face)), side = sideOf(fwd);
  const adult = makeGhost(1.45), g = makeGhost(), s = makeSpark();
  const pa = base.clone().addScaledVector(fwd, 2.2), pk = base.clone().addScaledVector(fwd, 4.2);
  adult.place(pa, face);
  g.place(pk, face + Math.PI);
  const win = haloSprite(0xffc27a, 4, 0);  // 窓からこぼれる灯り
  win.position.copy(base).addScaledVector(fwd, 3).addScaledVector(side, 2).y += 2.3;
  const bread = haloSprite(0xffe2b0, 0.9, 0);
  const sp = pk.clone().addScaledVector(side, 1.1);
  sp.y = groundY(sp.x, sp.z) + 1.5;
  scene.add(win, bread);
  const hand = (p) => V(p.x, groundY(p.x, p.z) + 1.1, p.z);
  return {
    center: base.clone().addScaledVector(fwd, 3).setY(base.y + 1.6), radius: 11, height: 3.5, a0: face + 0.6,
    update(t, f) {
      adult.fade(f); g.fade(f); s.material.opacity = 0.9 * f;
      win.material.opacity = 0.6 * f; bread.material.opacity = 0.9 * f;
      adult.armR.rotation.x = t > 1.5 && t < 4.5 ? -1.2 : 0;
      g.armR.rotation.x = t > 2 && t < 6 ? -1.2 : 0;
      // パンは、大人の手からあの子へ、あの子から妖精へ
      const ha = hand(pa.clone().addScaledVector(fwd, 0.6)), hk = hand(pk.clone().addScaledVector(fwd, -0.6));
      if (t < 2.5) bread.position.copy(ha);
      else if (t < 4) bread.position.lerpVectors(ha, hk, ease((t - 2.5) / 1.5));
      else if (t < 6) bread.position.copy(hk);
      else bread.position.lerpVectors(hk, sp, ease(Math.min((t - 6) / 1.5, 1)));
      if (t > 5.5) g.root.rotation.y = lerp(g.root.rotation.y, faceTo(pk, sp), 0.05);
      g.armL.rotation.x = t > 5.5 && t < 8 ? -1.3 : 0;
      s.position.copy(sp).y += Math.sin(t * 2) * 0.12;
    },
    dispose() { scene.remove(adult.root, g.root, s, win, bread); },
  };
};

MEMORIES[3].vignette = () => {
  // 回りだした風車のまわりを、両手を広げて駆けまわる子どもたち
  const base = mill.position.clone();
  const kids = [makeGhost(), makeGhost(0.9), makeGhost(0.95)];
  const s = makeSpark();
  return {
    center: base.clone().setY(base.y + 6), radius: 24, height: 5,
    update(t, f) {
      kids.forEach((g, i) => {
        const a = t * 0.7 + (i * Math.PI * 2) / 3;
        const p = V(base.x + Math.sin(a) * 7.5, 0, base.z + Math.cos(a) * 7.5);
        g.place(p, Math.atan2(Math.cos(a), -Math.sin(a)));
        g.fade(f);
        g.armL.rotation.z = -1.3; g.armR.rotation.z = 1.3;
        const step = Math.sin(t * 10 + i) * 0.6;
        g.legs[0].rotation.x = step; g.legs[1].rotation.x = -step;
      });
      const a = t * 0.7 - 0.5;
      s.position.set(base.x + Math.sin(a) * 7.5, groundY(base.x, base.z) + 2.2, base.z + Math.cos(a) * 7.5);
      s.material.opacity = 0.9 * f;
    },
    dispose() { scene.remove(...kids.map((g) => g.root), s); },
  };
};

const sceneFairyGoal = new THREE.Vector3();
function playMemory(o) {
  const v = o.memory.vignette();
  // 撮る向きは記憶ごとに決めておく（なければ、いまのカメラの側から）
  const a0 = v.a0 ?? Math.atan2(camera.position.x - v.center.x, camera.position.z - v.center.z);
  const cam = orbit(v.center, v.radius, v.height, a0, 0.045);
  narrate(...o.text, release);
  playShots([{
    dur: null, tail: 2.2, chase: 1.1, cam,
    update(t) {
      v.update(t, shotFade(t, 2.2));
      // 妖精は、記憶の少し上、画面の端から、それを見まもる
      const toCam = V(camera.position.x - v.center.x, 0, camera.position.z - v.center.z).normalize();
      director.fairyGoal = sceneFairyGoal.copy(v.center).addScaledVector(sideOf(toCam), 3.2)
        .addScaledVector(toCam, 1.5).setY(v.center.y + 2.4);
    },
    exit: () => v.dispose(),
  }], () => {
    cinema(false);
    audio?.motif(true);
    following = true; zoomIn = true; followDist = 22;
    lastTouch = elapsed;
    if (found === MEMORIES.length) {
      narrate(S.allFound, () => { bellReady = true; }, S.toTower);
    }
  });
}

// ---------- 音（最初に触れたときから鳴りはじめる） ----------
// 風の音と、ときおり水の底から聞こえてくる鐘。すべてその場で合成する
const soundBtn = document.getElementById('sound');
let audio = null, soundOn = true;
function startAudio() {
  if (audio) return;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 5);
  master.connect(ctx.destination);

  // 風：ゆっくり強弱する帯域ノイズ
  const noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0, last = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // 赤みがかったノイズ
    data[i] = last * 3.5;
  }
  const wind = ctx.createBufferSource();
  wind.buffer = noise; wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass'; windFilter.frequency.value = 420; windFilter.Q.value = 0.6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.22;
  const gust = ctx.createOscillator(), gustDepth = ctx.createGain();
  gust.frequency.value = 0.07; gustDepth.gain.value = 0.12;
  gust.connect(gustDepth).connect(windGain.gain);
  wind.connect(windFilter).connect(windGain).connect(master);
  wind.start(); gust.start();

  // 鐘：水を通したようにくぐもった、長い余韻
  const bellFilter = ctx.createBiquadFilter();
  bellFilter.type = 'lowpass'; bellFilter.frequency.value = 900;
  const echo = ctx.createDelay(2); echo.delayTime.value = 0.42;
  const echoGain = ctx.createGain(); echoGain.gain.value = 0.35;
  bellFilter.connect(master);
  bellFilter.connect(echo).connect(echoGain).connect(echo);
  echoGain.connect(master);
  // 澄んだ音の行き先：そのまま＋こだま
  const clear = ctx.createGain();
  clear.connect(master);
  clear.connect(echo);

  function strike(dest, gain, length, when = 0) {
    const now = ctx.currentTime + when;
    [[1, 0.5], [2.76, 0.22], [5.4, 0.12], [8.93, 0.06]].forEach(([ratio, amp]) => {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.frequency.value = 174.6 * ratio;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(amp * gain, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + length / Math.sqrt(ratio));
      osc.connect(env).connect(dest);
      osc.start(now); osc.stop(now + length + 1);
    });
  }
  // 水の底の鐘は、こちらの鐘が鳴るまで聞こえつづける
  function ringUnderwater() {
    if (clockRunning) return;
    strike(bellFilter, 0.35, 9);
    setTimeout(ringUnderwater, 28000 + Math.random() * 22000);
  }
  setTimeout(ringUnderwater, 6000);

  // 記憶のかけらを拾う音：拾うたびに音階をひとつ上がる
  function chime(n) {
    const notes = [523.25, 587.33, 659.25, 783.99, 880];
    const now = ctx.currentTime;
    for (const [mul, amp] of [[1, 0.12], [2, 0.04], [3.01, 0.015]]) {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.frequency.value = notes[n % notes.length] * mul;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(amp, now + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(env).connect(clear);
      osc.start(now); osc.stop(now + 3);
    }
  }

  // 鐘楼の鐘：三度、澄んだ音で
  function bellClear() {
    for (let i = 0; i < 3; i++) strike(clear, 0.9, 14, i * 3.4);
  }

  // 夜：やわらかな和音と、虫の声
  function nightfall() {
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass'; padFilter.frequency.value = 1100;
    const pad = ctx.createGain();
    pad.gain.setValueAtTime(0, ctx.currentTime);
    pad.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 14);
    padFilter.connect(pad).connect(master);
    pad.connect(echo);
    for (const f of [174.61, 220, 261.63, 392, 440]) {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = f;
        osc.detune.value = detune;
        osc.connect(padFilter);
        osc.start();
      }
    }
    const cricket = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.frequency.value = 4300 + Math.random() * 500;
      env.gain.setValueAtTime(0, now);
      for (let p = 0; p < 3; p++) {
        env.gain.linearRampToValueAtTime(0.012, now + p * 0.07 + 0.01);
        env.gain.linearRampToValueAtTime(0, now + p * 0.07 + 0.045);
      }
      osc.connect(env).connect(master);
      osc.start(now); osc.stop(now + 0.3);
      setTimeout(cricket, 700 + Math.random() * 1600);
    };
    setTimeout(cricket, 6000);
  }

  // 主題の旋律：オルゴールのように。幕開け・回想・結末でくり返し流れる
  const MOTIF = [
    [440, 1], [523.25, 1], [587.33, 2], [523.25, 1], [440, 1], [392, 2],
    [349.23, 1], [392, 1], [440, 1], [523.25, 1], [440, 4],
  ];
  function musicBoxNote(freq, when) {
    for (const [mul, amp, len] of [[1, 0.09, 2.6], [2, 0.025, 1.2], [3.01, 0.008, 0.6]]) {
      const osc = ctx.createOscillator(), env = ctx.createGain();
      osc.frequency.value = freq * mul;
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(amp, when + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, when + len);
      osc.connect(env).connect(clear);
      osc.start(when); osc.stop(when + len + 0.1);
    }
  }
  function motif(short = false, beat = 0.46) {
    let when = ctx.currentTime + 0.05;
    for (const [freq, beats] of short ? MOTIF.slice(0, 6) : MOTIF) {
      musicBoxNote(freq, when);
      when += beats * beat;
    }
  }

  audio = { ctx, master, chime, bellClear, nightfall, motif };
  soundBtn.hidden = false;
}
addEventListener('pointerdown', startAudio, { once: true });
addEventListener('keydown', startAudio, { once: true });
// iPhone などでは、指を離した瞬間にしか音を出す許可が下りないことがある
for (const ev of ['touchend', 'click']) {
  addEventListener(ev, () => { if (audio && audio.ctx.state !== 'running') audio.ctx.resume(); }, { passive: true });
}
soundBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
soundBtn.addEventListener('click', () => {
  if (!audio) return;
  soundOn = !soundOn;
  audio.master.gain.setTargetAtTime(soundOn ? 0.5 : 0, audio.ctx.currentTime, 0.3);
  soundBtn.textContent = soundOn ? S.soundOn : S.soundOff;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
});

// ---------- しばらく触れずにいると、視点がゆっくり谷を巡る ----------
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastTouch = 0;
controls.autoRotateSpeed = -0.12;
controls.addEventListener('start', () => { controls.autoRotate = false; lastTouch = clock.getElapsedTime(); });
controls.addEventListener('end', () => { lastTouch = clock.getElapsedTime(); });

// ---------- リサイズ・ループ ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let lastT = 0;
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  const dt = Math.min(t - lastT, 0.05);
  lastT = t;
  windUniform.value = t;
  updateFairy(t, dt);
  updateStory(t, dt);
  updateEnding(t, dt);
  updateDirector(dt);
  applyWorld(worldNight, false);
  elapsed = t;

  // 光の粒をゆっくり漂わせる
  const arr = pGeo.attributes.position.array;
  for (let i = 0; i < PARTICLES; i++) {
    arr[i * 3]     += Math.sin(t * 0.3 + i) * 0.02;
    arr[i * 3 + 1] += Math.cos(t * 0.2 + i * 0.7) * 0.01;
    if (arr[i * 3 + 1] > 65) arr[i * 3 + 1] = 2;
  }
  pGeo.attributes.position.needsUpdate = true;

  // 灯籠の火が、かすかに揺れる
  for (const f of flames) {
    const ft = t + f.phase;
    const flicker = Math.sin(ft * 2.3) * 0.08 + Math.sin(ft * 5.7) * 0.05 + Math.sin(ft * 13.1) * 0.02;
    f.halo.opacity = 0.55 + flicker;
    f.core.opacity = 0.9 + flicker * 0.5;
    f.light.intensity = 8 + flicker * 12;
  }

  lake.material.uniforms.uTime.value = t;
  if (!reduceMotion && controls.enabled && !controls.autoRotate && t - lastTouch > 25) controls.autoRotate = true;

  controls.update();
  // カメラが地面にもぐらないように
  const floor = Math.max(heightAt(camera.position.x, camera.position.z), CFG.lakeLevel) + 1.5;
  if (camera.position.y < floor) camera.position.y = floor;
  renderer.render(scene, camera);
});

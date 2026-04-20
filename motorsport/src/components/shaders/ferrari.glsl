#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_hover;

// ---- SDF UTILS ----
float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdEllipse(vec2 p, vec2 ab) {
  p = abs(p);
  if(p.x > p.y){ p = p.yx; ab = ab.yx; }
  float l = ab.y*ab.y - ab.x*ab.x;
  float m = ab.x*p.x/l, m2 = m*m;
  float n = ab.y*p.y/l, n2 = n*n;
  float c = (m2+n2-1.0)/3.0;
  float c3 = c*c*c;
  float q = c3 + m2*n2*2.0;
  float d = c3 + m2*n2;
  float g = m + m*n2;
  float co;
  if(d<0.0){
    float h = acos(q/c3)/3.0;
    float s = cos(h);
    float t2 = sin(h)*sqrt(3.0);
    float rx = sqrt(-c*(s+t2+2.0)+m2);
    float ry = sqrt(-c*(s-t2+2.0)+m2);
    co = (ry + sign(l)*rx + abs(g)/(rx*ry) - m)/2.0;
  } else {
    float h = 2.0*m*n*sqrt(d);
    float s = sign(q+h)*pow(abs(q+h),1.0/3.0);
    float t2 = sign(q-h)*pow(abs(q-h),1.0/3.0);
    float rx = -(s+t2) - c*4.0 + 2.0*m2;
    float ry = (s-t2)*sqrt(3.0);
    float rm = sqrt(rx*rx + ry*ry);
    co = (ry/sqrt(rm-rx) + 2.0*g/rm - m)/2.0;
  }
  vec2 r2 = ab*vec2(co, sqrt(1.0-co*co));
  return length(r2-p)*sign(p.y-r2.y);
}

// ---- NOISE / FBM ----
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p); vec2 f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.1+vec2(1.7,9.2); a*=0.5; }
  return v;
}

// ---- FERRARI CAR SDF ----
float ferrari(vec2 p) {
  // Main body – low, wide
  float body    = sdBox(p - vec2(0.0, 0.04), vec2(0.38, 0.07));
  // Cabin / greenhouse
  float cabin   = sdBox(p - vec2(-0.04, 0.13), vec2(0.17, 0.05));
  // Front splitter
  float splitter= sdBox(p - vec2(0.36, -0.01), vec2(0.07, 0.018));
  // Rear wing
  float wingPost= sdBox(p - vec2(-0.36, 0.09), vec2(0.012, 0.06));
  float wingPlane=sdBox(p - vec2(-0.36, 0.15), vec2(0.09, 0.016));
  // Side skirts
  float skirtL  = sdBox(p - vec2(0.1, -0.01), vec2(0.22, 0.012));
  float skirtR  = sdBox(p - vec2(-0.1,-0.01), vec2(0.22, 0.012));
  // Wheels (ellipses)
  float wFL     = sdEllipse(p - vec2(0.27,-0.07), vec2(0.065,0.065));
  float wRL     = sdEllipse(p - vec2(-0.26,-0.07), vec2(0.065,0.065));
  float car = min(body, cabin);
  car = min(car, splitter);
  car = min(car, min(wingPost, wingPlane));
  car = min(car, min(skirtL, skirtR));
  car = min(car, min(wFL, wRL));
  return car;
}

// ---- PRANCING HORSE (abstract SDF circles) ----
float horse(vec2 p) {
  float h = 1e10;
  // Very simple horse-like cluster of circles
  h = min(h, sdCircle(p - vec2(0.0, 0.06), 0.04));   // body
  h = min(h, sdCircle(p - vec2(0.02, 0.11), 0.025));  // neck
  h = min(h, sdCircle(p - vec2(0.03, 0.145), 0.018)); // head
  h = min(h, sdCircle(p - vec2(-0.015,0.0), 0.02));  // rear
  h = min(h, sdCircle(p - vec2(0.015,-0.02), 0.015)); // front leg
  return h;
}

void main() {
  vec2 ar = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv = (v_uv - 0.5) * ar;

  float t = u_time;
  float h = u_hover;
  float speed = mix(0.3, 1.0, h);

  // ---- BACKGROUND ----
  vec3 bgCol = vec3(0.02, 0.01, 0.02);

  // ---- PRANCING HORSE WATERMARK ----
  float hs = horse(uv * 1.2 - vec2(0.0, -0.1));
  float horseMask = smoothstep(0.005, -0.005, hs);
  bgCol += horseMask * vec3(0.91, 0.0, 0.17) * 0.05;

  // ---- SPEED LINES ----
  float lines = 0.0;
  for(int i=0; i<14; i++) {
    float y = float(i) * 0.06 - 0.38;
    float x = fract(uv.x*0.4 + t*speed*(0.5+float(i)*0.04) + float(i)*0.137);
    float lineW = mix(0.002, 0.001, h);
    lines += smoothstep(lineW, 0.0, abs(uv.y - y))
           * smoothstep(0.95, 0.15, x)
           * (0.4 + float(i%3)*0.15);
  }

  // ---- CAR ----
  float car = ferrari(uv);
  float carMask = smoothstep(0.004, 0.0, car);

  // Glow around car
  float glow = smoothstep(0.18, 0.0, car) * mix(0.35, 1.2, h);

  // Inner highlight
  float highlight = smoothstep(0.01, 0.0, car - 0.012) * mix(0.5, 1.0, h);

  // ---- CHROMATIC ABERRATION on hover ----
  float ca = h * 0.006;
  float carR = smoothstep(0.004, 0.0, ferrari(uv - vec2(ca, 0.0)));
  float carB = smoothstep(0.004, 0.0, ferrari(uv + vec2(ca, 0.0)));

  // ---- FLAME shader ----
  float flame = 0.0;
  if(h > 0.05) {
    // Flame origin: exhaust at rear of car
    vec2 fp = uv - vec2(-0.42, 0.04);
    fp.x *= -1.0; // flip to point right
    // FBM flame shape
    float fbmVal = fbm(fp * vec2(8.0, 5.0) + vec2(t * 4.0, t * 1.5));
    float flameSDF = fp.x * 3.5 - fbmVal * 1.2;
    float flameShape = smoothstep(0.0, -0.5, flameSDF)
                     * smoothstep(0.12, 0.0, abs(fp.y) - fbmVal * 0.05)
                     * smoothstep(0.0, 0.02, fp.x);
    flame = flameShape * h;
  }

  // ---- PARTICLE EXHAUST ----
  float particles = 0.0;
  if(h > 0.1) {
    for(int i=0; i<12; i++) {
      float seed = float(i) * 1.37;
      float lt = fract(t * (0.8 + float(i)*0.07) + seed);
      float px = -0.42 - lt * (0.25 + hash(vec2(seed, 0.1)) * 0.1);
      float py = 0.04 + sin(seed * 5.0) * 0.04
               + (hash(vec2(seed, 0.3)) - 0.5) * 0.06 * lt;
      float pr = 0.006 * (1.0 - lt);
      float pd = length(uv - vec2(px, py)) - pr;
      particles += smoothstep(0.003, 0.0, pd) * (1.0 - lt) * h;
    }
  }

  // ---- ENGINE REV RIPPLE ----
  float ripple = 0.0;
  if(h > 0.3) {
    float rd = length(uv);
    float phase = fract(rd * 6.0 - t * 3.0);
    ripple = smoothstep(0.05, 0.0, abs(phase - 0.5) - 0.4)
           * smoothstep(0.7, 0.0, rd) * h * 0.4;
  }

  // ---- COLOR COMPOSE ----
  vec3 red    = vec3(0.91, 0.0, 0.17);
  vec3 orange = vec3(1.0, 0.5, 0.0);
  vec3 yellow = vec3(1.0, 0.9, 0.0);
  vec3 chrome = vec3(0.85, 0.9, 1.0);

  vec3 col = bgCol;
  col += lines * vec3(0.4, 0.05, 0.05) * 0.8;

  // Glow halo
  col += glow * red * 0.6;
  col += ripple * red;

  // Car body (chromatic aberration splits R/B on hover)
  col.r += carR * mix(0.75, 0.95, h);
  col.g += carMask * 0.05;
  col.b += carB * 0.08;
  col += highlight * chrome * 0.3;

  // Flame
  float flameT = clamp(fbm(uv * 3.0 + t) * flame * 3.0, 0.0, 1.0);
  col += flame * mix(red, orange, flameT) * 2.5;
  col += flame * yellow * flameT * 0.8;

  // Exhaust particles
  col += particles * vec3(1.0, 0.7, 0.4);

  // Mouse proximity glow
  float mouseDist = length(uv - (u_mouse - 0.5) * ar);
  col += smoothstep(0.4, 0.0, mouseDist) * red * 0.08;

  col = clamp(col, 0.0, 1.0);
  // Subtle vignette
  float vig = 1.0 - smoothstep(0.4, 1.0, length(uv*0.8));
  col *= vig;

  fragColor = vec4(col, 1.0);
}

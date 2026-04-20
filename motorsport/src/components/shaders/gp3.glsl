#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_hover;

float sdBox(vec2 p, vec2 b){
  vec2 d=abs(p)-b;
  return length(max(d,0.0))+min(max(d.x,d.y),0.0);
}
float sdCircle(vec2 p,float r){ return length(p)-r; }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash1(float n){ return fract(sin(n)*43758.5453); }

// ---- GP3 / FORMULA CAR SDF ----
float formula(vec2 p) {
  // Narrow main body
  float body    = sdBox(p - vec2(0.0, 0.03), vec2(0.32, 0.04));
  // Tall airbox above cockpit
  float airbox  = sdBox(p - vec2(-0.02, 0.13), vec2(0.04, 0.07));
  // Low nose cone
  float nose    = sdBox(p - vec2(0.28, 0.01), vec2(0.1, 0.025));
  float noseTip = sdBox(p - vec2(0.38, 0.0), vec2(0.02, 0.012));
  // Front wing
  float fwMain  = sdBox(p - vec2(0.36,-0.03), vec2(0.07, 0.012));
  float fwEnd   = sdBox(p - vec2(0.43,-0.03), vec2(0.012, 0.025));
  // Rear wing
  float rwMain  = sdBox(p - vec2(-0.31, 0.14), vec2(0.1, 0.012));
  float rwEnd   = sdBox(p - vec2(-0.41, 0.1), vec2(0.012, 0.04));
  // Exposed wheels
  float wFR     = sdCircle(p - vec2(0.26,-0.07), 0.055);
  float wFL     = sdCircle(p - vec2(0.26, 0.1),  0.04);   // smaller front-top
  float wRR     = sdCircle(p - vec2(-0.26,-0.07), 0.06);
  float wRL     = sdCircle(p - vec2(-0.26, 0.0), 0.015);
  // Sidepods
  float podR    = sdBox(p - vec2(0.12, 0.02), vec2(0.1, 0.032));
  float podL    = sdBox(p - vec2(-0.12, 0.02), vec2(0.1, 0.032));

  float car = min(body, airbox);
  car = min(car, min(nose, noseTip));
  car = min(car, min(fwMain, fwEnd));
  car = min(car, min(rwMain, rwEnd));
  car = min(car, min(wFR, wRR));
  car = min(car, min(podR, podL));
  return car;
}

void main() {
  vec2 ar  = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv  = (v_uv - 0.5) * ar;
  float t  = u_time;
  float h  = u_hover;
  float spd = mix(0.25, 1.0, h);

  vec3 bgCol = vec3(0.01, 0.02, 0.06);

  // ---- SPEED LINES (blue) ----
  float lines = 0.0;
  for(int i=0; i<16; i++){
    float y = float(i)*0.055 - 0.41;
    float x = fract(uv.x*0.35 + t*spd*(0.4+float(i)*0.035)+float(i)*0.19);
    lines += smoothstep(0.002,0.0,abs(uv.y-y))
            *smoothstep(0.9,0.1,x)
            *(0.3+float(i%4)*0.1);
  }

  // ---- AERO ENERGY LINES (idle) ----
  float aeroLines = 0.0;
  if(h < 0.8) {
    // trace aero surface of car with animated blue sparks
    float car0 = formula(uv);
    float onSurface = smoothstep(0.025, 0.015, abs(car0));
    float phase = fract(uv.x * 2.0 + t * 0.8);
    aeroLines = onSurface * phase * (1.0 - h);
  }

  // ---- CAR ----
  float car  = formula(uv);
  float carMask = smoothstep(0.004, 0.0, car);
  float glow    = smoothstep(0.2, 0.0, car) * mix(0.3, 1.3, h);
  float highlight = smoothstep(0.0, -0.015, car - 0.012) * h;

  // Chromatic aberration
  float ca = h * 0.007;
  float carR = smoothstep(0.004, 0.0, formula(uv - vec2(ca, 0.0)));
  float carB = smoothstep(0.004, 0.0, formula(uv + vec2(ca, 0.0)));

  // ---- TIRE SMOKE PARTICLE SYSTEM ----
  float smoke = 0.0;
  if(h > 0.1) {
    // 4 wheel positions
    vec2 wheels[4];
    wheels[0] = vec2( 0.26,-0.07);
    wheels[1] = vec2(-0.26,-0.07);
    wheels[2] = vec2( 0.26, 0.0);
    wheels[3] = vec2(-0.26, 0.0);

    for(int w=0; w<4; w++) {
      vec2 wpos = wheels[w];
      for(int i=0; i<18; i++){
        float seed = float(w*18+i);
        float lt   = fract(t*(0.6+hash1(seed)*0.4) + hash1(seed+100.0));
        float angle = hash1(seed+200.0)*6.28318;
        float vel   = 0.04 + hash1(seed+300.0)*0.12;
        float px    = wpos.x + cos(angle)*vel*lt;
        float py    = wpos.y + sin(angle)*vel*lt + lt*lt*0.05;
        float pr    = 0.009*(1.0-lt*0.8);
        float pd    = length(uv - vec2(px,py)) - pr;
        smoke += smoothstep(0.005, 0.0, pd)*(1.0-lt)*h*0.8;
      }
    }
    smoke = clamp(smoke, 0.0, 1.0);
  }

  // ---- COMPOSE ----
  vec3 blue   = vec3(0.0, 0.2, 1.0);
  vec3 silver = vec3(0.75, 0.85, 1.0);
  vec3 white  = vec3(0.95, 0.97, 1.0);

  vec3 col = bgCol;
  col += lines * blue * 0.5;
  col += aeroLines * blue * 0.6;

  col += glow * blue * 0.7;

  col.r += carR * 0.1;
  col.g += carMask * mix(0.2, 0.5, h);
  col.b += carB * mix(0.7, 1.0, h);
  col += highlight * silver * 0.4;

  col += smoke * white;

  // Mouse proximity glow
  float md = length(uv - (u_mouse-0.5)*ar);
  col += smoothstep(0.4,0.0,md)*blue*0.07;

  col = clamp(col,0.0,1.0);
  float vig = 1.0-smoothstep(0.4,1.0,length(uv*0.8));
  col *= vig;

  fragColor = vec4(col,1.0);
}

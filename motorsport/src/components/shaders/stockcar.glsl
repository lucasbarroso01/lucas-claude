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
float hash1(float n){ return fract(sin(n*73.1)+cos(n*37.3)*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

// ---- STOCK CAR SDF ----
float stockcar(vec2 p) {
  // High roofline body (stock silhouette)
  float body   = sdBox(p - vec2(0.0, 0.04), vec2(0.37, 0.075));
  // Tall cabin/roof
  float roof   = sdBox(p - vec2(-0.02, 0.145), vec2(0.19, 0.06));
  // Windshield slope (angled by cutting)
  float windF  = sdBox(p - vec2(0.16, 0.1), vec2(0.07, 0.055));
  float windR  = sdBox(p - vec2(-0.2, 0.1), vec2(0.06, 0.055));
  // Aggressive front bumper
  float bumperF= sdBox(p - vec2(0.37, 0.0), vec2(0.03, 0.05));
  // Rear bumper
  float bumperR= sdBox(p - vec2(-0.37, 0.0), vec2(0.03, 0.05));
  // Wheels
  float wFR    = sdCircle(p - vec2( 0.26,-0.08), 0.065);
  float wRR    = sdCircle(p - vec2(-0.26,-0.08), 0.065);
  // Livery stripes (horizontal bands within body)
  float stripe1 = sdBox(p - vec2(0.0, 0.06), vec2(0.36, 0.012));
  float stripe2 = sdBox(p - vec2(0.0, 0.02), vec2(0.36, 0.008));

  float car = min(body, roof);
  car = min(car, min(bumperF, bumperR));
  car = min(car, min(wFR, wRR));
  // stripes are separate for coloring
  return car;
}

float stockcarStripes(vec2 p) {
  float s1 = sdBox(p - vec2(0.0, 0.065), vec2(0.36, 0.01));
  float s2 = sdBox(p - vec2(0.0, 0.02),  vec2(0.36, 0.007));
  return min(s1, s2);
}

void main() {
  vec2 ar  = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv  = (v_uv - 0.5) * ar;
  float t  = u_time;
  float h  = u_hover;
  float spd = mix(0.3, 1.0, h);

  vec3 bgCol = vec3(0.01, 0.03, 0.01);

  // ---- SCANLINE EFFECT (idle) ----
  float scanline = 0.0;
  {
    float sl = sin((uv.y + t*0.05) * 200.0) * 0.5 + 0.5;
    scanline = sl * (1.0 - h*0.9) * 0.12;
  }

  // ---- SPEED LINES (green/yellow) ----
  float lines = 0.0;
  for(int i=0; i<14; i++){
    float y = float(i)*0.06 - 0.38;
    float x = fract(uv.x*0.4 + t*spd*(0.5+float(i)*0.04)+float(i)*0.23);
    lines += smoothstep(0.0025,0.0,abs(uv.y-y))
            *smoothstep(0.9,0.1,x)
            *(0.3+float(i%3)*0.15);
  }

  // ---- CAR ----
  float car     = stockcar(uv);
  float stripes = stockcarStripes(uv);
  float carMask = smoothstep(0.004, 0.0, car);
  float strMask = smoothstep(0.003, 0.0, stripes);
  // mask stripes inside body only
  float bodyMask = smoothstep(0.004, 0.0, sdBox(uv - vec2(0.0,0.04), vec2(0.37,0.075)));
  strMask *= bodyMask;

  float glow      = smoothstep(0.2, 0.0, car) * mix(0.3, 1.2, h);
  float highlight = smoothstep(0.0, -0.015, car - 0.012) * h;

  float ca  = h * 0.006;
  float carR = smoothstep(0.004, 0.0, stockcar(uv - vec2(ca,0.0)));
  float carB = smoothstep(0.004, 0.0, stockcar(uv + vec2(ca,0.0)));

  // ---- SPARK PARTICLE SYSTEM ----
  float sparks = 0.0;
  if(h > 0.1) {
    for(int i=0; i<28; i++){
      float seed = float(i);
      float lt   = fract(t*(0.7+hash1(seed)*0.5) + hash1(seed+50.0));
      // sparks fly backward from car rear
      float vx   = -(0.15 + hash1(seed+100.0)*0.35);
      float vy   = (hash1(seed+200.0)-0.5)*0.2;
      float grav = -0.5 * lt * lt;
      float px   = -0.37 + vx * lt;
      float py   = (hash1(seed+300.0)-0.5)*0.08 + vy*lt + grav;
      float pr   = 0.005*(1.0-lt);
      float pd   = length(uv - vec2(px,py)) - pr;
      sparks += smoothstep(0.004, 0.0, pd)*(1.0-lt)*h;
    }
    sparks = clamp(sparks, 0.0, 1.0);
  }

  // ---- COMPOSE ----
  vec3 green   = vec3(0.0, 0.65, 0.32);
  vec3 yellow  = vec3(1.0, 0.85, 0.0);
  vec3 chrome  = vec3(0.85, 0.9, 1.0);
  vec3 sparkCol = vec3(1.0, 0.85, 0.3);

  vec3 col = bgCol;
  col += scanline * vec3(0.05, 0.15, 0.02);
  col += lines * mix(green, yellow, 0.3) * 0.5;

  col += glow * green * 0.6;

  // Car body
  col.r += carR * mix(0.05, 0.2, h);
  col.g += carMask * mix(0.55, 0.85, h);
  col.b += carB * 0.05;

  // Livery stripes in yellow
  col += strMask * yellow * 0.8;
  col += highlight * chrome * 0.3;

  // Sparks
  col += sparks * sparkCol * 2.0;

  // Mouse proximity
  float md = length(uv-(u_mouse-0.5)*ar);
  col += smoothstep(0.4,0.0,md)*green*0.07;

  col = clamp(col,0.0,1.0);
  float vig = 1.0-smoothstep(0.4,1.0,length(uv*0.8));
  col *= vig;

  fragColor = vec4(col,1.0);
}

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
float sdEllipse(vec2 p, vec2 ab){
  p=abs(p);
  if(p.x>p.y){p=p.yx;ab=ab.yx;}
  float l=ab.y*ab.y-ab.x*ab.x, m=ab.x*p.x/l, m2=m*m, n=ab.y*p.y/l, n2=n*n;
  float c=(m2+n2-1.0)/3.0, c3=c*c*c, q=c3+m2*n2*2.0, d=c3+m2*n2, g=m+m*n2;
  float co;
  if(d<0.0){
    float h2=acos(q/c3)/3.0, s=cos(h2), t2=sin(h2)*sqrt(3.0);
    float rx=sqrt(-c*(s+t2+2.0)+m2), ry=sqrt(-c*(s-t2+2.0)+m2);
    co=(ry+sign(l)*rx+abs(g)/(rx*ry)-m)/2.0;
  } else {
    float h2=2.0*m*n*sqrt(d), s=sign(q+h2)*pow(abs(q+h2),1.0/3.0), t2=sign(q-h2)*pow(abs(q-h2),1.0/3.0);
    float rx=-(s+t2)-c*4.0+2.0*m2, ry=(s-t2)*sqrt(3.0), rm=sqrt(rx*rx+ry*ry);
    co=(ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
  }
  vec2 r2=ab*vec2(co,sqrt(1.0-co*co));
  return length(r2-p)*sign(p.y-r2.y);
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash1(float n){ return fract(sin(n)*43758.5453); }

// ---- PORSCHE 911 GT3 CUP SDF ----
float porsche(vec2 p) {
  // Wide, low body
  float body    = sdBox(p - vec2(0.0, 0.04), vec2(0.36, 0.065));
  // Iconic sloped roofline (shorter, rounder)
  float roof    = sdBox(p - vec2(-0.05, 0.12), vec2(0.2, 0.055));
  // Front end — flat
  float front   = sdBox(p - vec2(0.34, 0.02), vec2(0.04, 0.04));
  // Round iconic headlights
  float headL   = sdCircle(p - vec2(0.31, 0.07), 0.025);
  float headR   = sdCircle(p - vec2(0.31,-0.02), 0.018);
  // Flat-6 rear engine bump
  float rearBump= sdBox(p - vec2(-0.3, 0.07), vec2(0.08, 0.05));
  // Wide rear wing
  float rwPost  = sdBox(p - vec2(-0.36, 0.09), vec2(0.012, 0.05));
  float rwPlane = sdBox(p - vec2(-0.36, 0.14), vec2(0.11, 0.014));
  // Wide fenders
  float fenderF = sdEllipse(p - vec2(0.25, 0.04), vec2(0.09, 0.055));
  float fenderR = sdEllipse(p - vec2(-0.25, 0.04), vec2(0.09, 0.055));
  // Wheels
  float wFR     = sdCircle(p - vec2( 0.26,-0.07), 0.06);
  float wRR     = sdCircle(p - vec2(-0.26,-0.07), 0.06);

  float car = min(body, roof);
  car = min(car, min(front, min(headL, headR)));
  car = min(car, rearBump);
  car = min(car, min(rwPost, rwPlane));
  car = min(car, min(fenderF, fenderR));
  car = min(car, min(wFR, wRR));
  return car;
}

float wheelRims(vec2 p) {
  float r1 = abs(sdCircle(p - vec2( 0.26,-0.07), 0.038)) - 0.004;
  float r2 = abs(sdCircle(p - vec2(-0.26,-0.07), 0.038)) - 0.004;
  return min(r1, r2);
}

void main() {
  vec2 ar  = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv  = (v_uv - 0.5) * ar;
  float t  = u_time;
  float h  = u_hover;
  float spd = mix(0.3, 1.0, h);

  vec3 bgCol = vec3(0.02, 0.018, 0.01);

  // ---- SPINNING RIM GLOW (idle) ----
  float rimGlow = 0.0;
  {
    vec2 wheelPosF = vec2( 0.26,-0.07);
    vec2 wheelPosR = vec2(-0.26,-0.07);
    // Rotating spokes
    for(int i=0; i<5; i++){
      float angle = float(i)/5.0*6.28318 + t*(1.0 - h*0.5);
      vec2 spokeDir = vec2(cos(angle), sin(angle));
      for(int w=0; w<2; w++){
        vec2 wpos = (w==0) ? wheelPosF : wheelPosR;
        vec2 rp = uv - wpos;
        float proj = dot(rp, spokeDir);
        float perp = length(rp - proj*spokeDir);
        float spoke = smoothstep(0.004,0.0,perp) * smoothstep(0.0,0.005,proj) * smoothstep(0.055,0.0,proj);
        rimGlow += spoke;
      }
    }
    // Rim ring glow
    float rf = smoothstep(0.01,0.0,abs(sdCircle(uv-wheelPosF,0.044)));
    float rr = smoothstep(0.01,0.0,abs(sdCircle(uv-wheelPosR,0.044)));
    rimGlow += (rf + rr) * 0.8;
  }

  // ---- SPEED LINES (gold) ----
  float lines = 0.0;
  for(int i=0; i<14; i++){
    float y = float(i)*0.06 - 0.38;
    float x = fract(uv.x*0.4 + t*spd*(0.5+float(i)*0.04)+float(i)*0.21);
    lines += smoothstep(0.002,0.0,abs(uv.y-y))
            *smoothstep(0.9,0.1,x)
            *(0.3+float(i%3)*0.15);
  }

  // ---- CAR ----
  float car     = porsche(uv);
  float carMask = smoothstep(0.004, 0.0, car);
  float glow    = smoothstep(0.2, 0.0, car) * mix(0.35, 1.2, h);
  float rims    = smoothstep(0.005, 0.0, wheelRims(uv));
  float rimW    = smoothstep(0.012, 0.0, abs(wheelRims(uv)));

  float ca  = h * 0.006;
  float carR = smoothstep(0.004, 0.0, porsche(uv - vec2(ca, 0.0)));
  float carB = smoothstep(0.004, 0.0, porsche(uv + vec2(ca, 0.0)));

  // ---- RAIN ON HOVER ----
  float rain = 0.0;
  if(h > 0.1) {
    for(int i=0; i<30; i++){
      float seed = float(i);
      float x0   = hash1(seed)*ar.x - ar.x*0.5;
      float speed2 = 0.3 + hash1(seed+10.0)*0.4;
      float lt   = fract(t*speed2*0.5 + hash1(seed+20.0));
      float py   = 0.45 - lt * 0.9;
      float px   = x0 + sin(lt * 6.28 + seed) * 0.005;
      float len  = 0.03 + hash1(seed+30.0)*0.04;
      // Rain streak: thin vertical line segment
      float dx   = abs(uv.x - px);
      float dy   = uv.y - py;
      float streak = smoothstep(0.002, 0.0, dx)
                   * smoothstep(0.0, 0.002, dy)
                   * smoothstep(len, 0.0, dy)
                   * (1.0 - lt * 0.3);
      rain += streak * h;
    }
    rain = clamp(rain, 0.0, 1.0);
  }

  // ---- COMPOSE ----
  vec3 gold    = vec3(0.72, 0.53, 0.04);
  vec3 goldBrt = vec3(1.0, 0.85, 0.3);
  vec3 darkGray= vec3(0.12, 0.12, 0.15);
  vec3 chrome  = vec3(0.85, 0.9, 1.0);
  vec3 rainCol = vec3(0.5, 0.65, 0.9);

  vec3 col = bgCol;
  col += lines * gold * 0.5;

  // Idle rim glow
  col += rimGlow * gold * mix(0.6, 0.3, h);

  col += glow * gold * 0.7;

  // Car body (dark gray / gold theme)
  vec3 bodyColor = mix(darkGray, gold * 0.6, 0.4);
  col.r += carR * mix(bodyColor.r, goldBrt.r * 0.9, h);
  col.g += carMask * mix(bodyColor.g, goldBrt.g * 0.6, h);
  col.b += carB * mix(bodyColor.b, 0.05, h);

  // Rim gold accent
  col += rims  * goldBrt * 0.5;
  col += rimW  * gold    * 0.3;

  // Rain streaks (blue-ish)
  col += rain * rainCol;

  // Mouse proximity
  float md = length(uv-(u_mouse-0.5)*ar);
  col += smoothstep(0.4,0.0,md)*gold*0.07;

  col = clamp(col,0.0,1.0);
  float vig = 1.0-smoothstep(0.4,1.0,length(uv*0.8));
  col *= vig;

  fragColor = vec4(col,1.0);
}

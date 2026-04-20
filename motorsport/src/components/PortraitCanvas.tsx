import { useEffect, useRef, useState } from 'react'

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_hover;

float sdCircle(vec2 p, float r){ return length(p)-r; }
float sdBox(vec2 p, vec2 b){
  vec2 d=abs(p)-b;
  return length(max(d,0.0))+min(max(d.x,d.y),0.0);
}
float sdEllipse(vec2 p, vec2 ab){
  p=abs(p);
  if(p.x>p.y){p=p.yx;ab=ab.yx;}
  float l=ab.y*ab.y-ab.x*ab.x, m=ab.x*p.x/l, n=ab.y*p.y/l;
  float c=(m*m+n*n-1.0)/3.0, c3=c*c*c, q=c3+m*m*n*n*2.0;
  float d=c3+m*m*n*n, g=m+m*n*n;
  float co;
  if(d<0.0){
    float h2=acos(q/c3)/3.0;
    float s=cos(h2),t2=sin(h2)*1.732;
    float rx=sqrt(-c*(s+t2+2.0)+m*m), ry=sqrt(-c*(s-t2+2.0)+m*m);
    co=(ry+sign(l)*rx+abs(g)/(rx*ry)-m)/2.0;
  } else {
    float h2=2.0*m*n*sqrt(d);
    float s=sign(q+h2)*pow(abs(q+h2),0.333), t2=sign(q-h2)*pow(abs(q-h2),0.333);
    float rx=-(s+t2)-c*4.0+2.0*m*m, ry=(s-t2)*1.732, rm=sqrt(rx*rx+ry*ry);
    co=(ry/sqrt(rm-rx)+2.0*g/rm-m)/2.0;
  }
  vec2 r2=ab*vec2(co,sqrt(1.0-co*co));
  return length(r2-p)*sign(p.y-r2.y);
}
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

// Abstract figure SDF
float figure(vec2 p) {
  // Head
  float head    = sdCircle(p - vec2(0.0, 0.32), 0.1);
  // Neck
  float neck    = sdBox(p - vec2(0.0, 0.2), vec2(0.025, 0.05));
  // Shoulders/torso
  float torso   = sdBox(p - vec2(0.0, 0.0), vec2(0.14, 0.18));
  float shoulder = sdEllipse(p - vec2(0.0, 0.15), vec2(0.18, 0.05));
  // Arms
  float armL    = sdBox(p - vec2( 0.2, 0.0), vec2(0.03, 0.15));
  float armR    = sdBox(p - vec2(-0.2, 0.0), vec2(0.03, 0.15));
  float f = min(head, neck);
  f = min(f, min(torso, shoulder));
  f = min(f, min(armL, armR));
  return f;
}

void main() {
  vec2 ar  = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv  = (v_uv - 0.5) * ar;
  float t  = u_time;
  float h  = u_hover;

  vec3 bgCol = vec3(0.02, 0.04, 0.1);
  vec3 blue  = vec3(0.0, 0.4, 1.0);
  vec3 cyan  = vec3(0.0, 0.8, 1.0);

  // Subtle grid
  vec2 grid = fract(uv * 8.0);
  float gridLine = min(
    smoothstep(0.03, 0.0, min(grid.x, 1.0-grid.x)),
    smoothstep(0.03, 0.0, min(grid.y, 1.0-grid.y))
  ) * 0.06;

  // Figure
  float fig = figure(uv);
  float figMask = smoothstep(0.008, 0.0, fig);
  float figGlow = smoothstep(0.25, 0.0, fig) * mix(0.3, 1.0, h);

  // Outline traces with moving energy
  float outline = smoothstep(0.015, 0.008, abs(fig));
  float energyPhase = fract(uv.x*1.5 + uv.y*0.5 + t*0.6);
  float energy = outline * smoothstep(0.0, 0.3, energyPhase) * smoothstep(1.0, 0.7, energyPhase);

  // Data stream particles
  float particles = 0.0;
  for(int i=0; i<20; i++){
    float seed = float(i);
    float py = fract(-t*(0.15+hash(vec2(seed,0.0))*0.2) + hash(vec2(seed,1.0)));
    py = py * 1.0 - 0.5;
    float px = (hash(vec2(seed,2.0)) - 0.5) * ar.x;
    float pd = length(uv - vec2(px, py));
    float pr = 0.005 + hash(vec2(seed,3.0))*0.006;
    particles += smoothstep(pr, 0.0, pd)
               * smoothstep(0.35, 0.0, abs(fig + 0.05))  // near figure
               * mix(0.6, 1.0, h);
  }

  // Heat shimmer on hover
  vec2 shiftUV = uv;
  if(h > 0.1) {
    float shimmer = sin(uv.y * 40.0 + t * 5.0) * 0.004 * h;
    shiftUV.x += shimmer;
  }
  float figShimmer = figure(shiftUV);
  float figShimmerMask = smoothstep(0.008, 0.0, figShimmer);

  vec3 col = bgCol;
  col += gridLine * blue * 0.4;
  col += figGlow * blue * 0.5;
  col += energy * cyan * 0.8;
  col += particles * cyan * 1.5;

  // Figure body fill
  col += figShimmerMask * mix(blue * 0.5, cyan * 0.8, h);

  // Mouse interaction
  float md = length(uv - (u_mouse-0.5)*ar);
  col += smoothstep(0.5,0.0,md) * blue * 0.1;

  // Center glow
  col += smoothstep(0.6, 0.0, length(uv)) * blue * 0.08;

  col = clamp(col, 0.0, 1.0);
  float vig = 1.0 - smoothstep(0.35, 0.85, length(uv*0.9));
  col *= vig;
  fragColor = vec4(col, 1.0);
}
`

const VERT = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

export default function PortraitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const hoverRef = useRef(0)
  const targetHoverRef = useRef(0)
  const [active, setActive] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: 0.1 })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { antialias: false })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes  = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uHover = gl.getUniformLocation(prog, 'u_hover')
    gl.uniform2f(uMouse, 0.5, 0.5)
    gl.uniform1f(uHover, 0)

    const render = (time: number) => {
      hoverRef.current += (targetHoverRef.current - hoverRef.current) * 0.05
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h; gl.viewport(0,0,w,h)
      }
      gl.uniform1f(uTime, time*0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uHover, hoverRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(rafRef.current); gl.deleteProgram(prog) }
  }, [active])

  const handleMouseEnter = () => { targetHoverRef.current = 1 }
  const handleMouseLeave = () => { targetHoverRef.current = 0 }
  const handleMouseMove = (_e: React.MouseEvent<HTMLDivElement>) => {
    // Mouse position passed to shader if needed
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ minHeight: '400px' }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
    </div>
  )
}

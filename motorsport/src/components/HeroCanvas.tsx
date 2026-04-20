import { useEffect, useRef } from 'react'

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_hover;

#define PI 3.14159265

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0 - 2.0*f);
  float a = hash(i);
  float b = hash(i + vec2(1,0));
  float c = hash(i + vec2(0,1));
  float d = hash(i + vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time;

  // Perspective tunnel: radial distance from center
  float dist = length(p);
  float angle = atan(p.y, p.x);

  // Tunnel perspective — converging track lines
  float speed = 1.8 + u_hover * 1.2;
  float tunnel = fract(1.0 / (dist + 0.001) * 0.08 - t * speed);

  // Track lanes — 8 radial lines
  float lanes = 0.0;
  float numLanes = 8.0;
  float laneWidth = 0.03;
  for (float i = 0.0; i < numLanes; i++) {
    float a = i / numLanes * 2.0 * PI;
    float da = mod(abs(angle - a), PI * 2.0);
    da = min(da, PI * 2.0 - da);
    float lane = smoothstep(laneWidth, laneWidth * 0.2, da);
    float fade = smoothstep(0.0, 0.05, dist) * smoothstep(0.8, 0.3, dist);
    lanes += lane * fade * (tunnel * 0.5 + 0.3);
  }

  // Horizontal speed lines (center band)
  float hLines = 0.0;
  for (int i = 0; i < 18; i++) {
    float y = (float(i) - 8.5) / 16.0 * 0.6;
    float lineY = abs(p.y - y);
    float x = fract(p.x * 0.3 + t * (1.2 + float(i) * 0.04) + float(i) * 0.137);
    float lineLen = smoothstep(0.9, 0.2, x);
    float brightness = smoothstep(0.003, 0.0, lineY) * lineLen;
    hLines += brightness * (0.4 + float(i % 3) * 0.2);
  }

  // Center vignette glow
  float centerGlow = smoothstep(0.6, 0.0, dist) * 0.5;

  // Red speed streaks
  float redStreaks = 0.0;
  for (int i = 0; i < 6; i++) {
    float y = (float(i) - 2.5) * 0.15 + sin(t * 0.7 + float(i)) * 0.02;
    float lineY = abs(p.y - y);
    float x = fract(p.x * 0.2 + t * (2.0 + float(i) * 0.1));
    redStreaks += smoothstep(0.002, 0.0, lineY) * smoothstep(0.95, 0.1, x);
  }

  // DoF blur edges
  float edgeFade = 1.0 - smoothstep(0.3, 0.7, dist);

  // Depth fog in center
  float fog = smoothstep(0.0, 0.15, dist);

  // Color composition
  vec3 bgColor  = vec3(0.02, 0.04, 0.08);
  vec3 blueGlow = vec3(0.0, 0.2, 0.8);
  vec3 redColor  = vec3(0.91, 0.0, 0.17);
  vec3 whiteColor = vec3(0.85, 0.9, 1.0);

  vec3 col = bgColor;
  col += lanes * blueGlow * edgeFade;
  col += hLines * whiteColor * edgeFade * 0.7;
  col += redStreaks * redColor;
  col += centerGlow * blueGlow * 0.3;

  // Radial depth darkening at edges (DoF)
  col *= 1.0 - smoothstep(0.4, 0.8, dist) * 0.6;

  // Horizon gradient at center
  float horizonFade = smoothstep(0.0, 0.06, dist);
  col = mix(vec3(0.05, 0.08, 0.25), col, horizonFade);

  // Subtle noise grain
  float grain = (noise(uv * 250.0 + t * 0.5) - 0.5) * 0.04;
  col += grain;

  // Vignette
  float vignette = 1.0 - dist * 1.1;
  col *= max(vignette, 0.0);

  fragColor = vec4(col, 1.0);
}
`

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const glRef = useRef<WebGL2RenderingContext | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
    if (!gl) return
    glRef.current = gl

    const VERT = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime  = gl.getUniformLocation(prog, 'u_time')
    const uRes   = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uHover = gl.getUniformLocation(prog, 'u_hover')

    gl.uniform2f(uMouse, 0.5, 0.5)
    gl.uniform1f(uHover, 0.0)

    const render = (t: number) => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform1f(uTime, t * 0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(rafRef.current); gl.deleteProgram(prog) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

import { useEffect, useRef, useState } from 'react'

const FRAG = `#version 300 es
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

// Oval race track top-down view
float track(vec2 p) {
  float outer = sdBox(p, vec2(0.55, 0.3));  // outer oval (simplified as rounded box)
  float outerR = abs(outer) - 0.05;
  // Actually do oval (rounded box)
  vec2 q = abs(p) - vec2(0.35, 0.15);
  float outerDist = length(max(q,0.0)) + min(max(q.x,q.y),0.0) - 0.18;
  // inner oval
  vec2 q2 = abs(p) - vec2(0.2, 0.05);
  float innerDist = length(max(q2,0.0)) + min(max(q2.x,q2.y),0.0) - 0.1;
  // track band between inner and outer
  return max(outerDist, -innerDist);
}

void main() {
  vec2 ar  = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 uv  = (v_uv - 0.5) * ar;
  float t  = u_time;

  vec3 bgCol = vec3(0.02, 0.01, 0.05);

  // Track
  float tr = track(uv * 1.2);
  float trackMask = smoothstep(0.015, 0.0, abs(tr));
  float trackEdge = smoothstep(0.02, 0.0, abs(tr + 0.01));

  // Moving car on track
  float carAngle = t * 0.7;
  // Parametric position along track oval
  vec2 trackOvalA = vec2(0.35, 0.15);
  float trackOvalR = 0.16;
  vec2 carPos = vec2(
    cos(carAngle) * (trackOvalA.x + trackOvalR * 0.5),
    sin(carAngle) * (trackOvalA.y + trackOvalR * 0.3)
  ) / 1.2;
  float car = sdBox(uv - carPos, vec2(0.025, 0.012));
  float carMask = smoothstep(0.006, 0.0, car);
  float carGlow = smoothstep(0.07, 0.0, car);

  // Speed streaks behind car
  float streaks = 0.0;
  vec2 carDir = vec2(-sin(carAngle), cos(carAngle) * 0.5);
  carDir = normalize(carDir);
  for(int i=1; i<=5; i++){
    vec2 sp = carPos - carDir * float(i) * 0.018;
    float sd2 = sdBox(uv - sp, vec2(0.02 - float(i)*0.003, 0.008));
    streaks += smoothstep(0.005,0.0,sd2) * (1.0-float(i)*0.18);
  }

  // Animated track lane markings
  float laneMarks = 0.0;
  {
    // dashed center line along oval
    float angle2 = atan(uv.y, uv.x);
    float dashPhase = fract(angle2 / 6.28318 * 8.0 - t * 0.4);
    vec2 qm = abs(uv) - vec2(0.29, 0.1);
    float centerLine = abs(length(max(qm,0.0)) + min(max(qm.x,qm.y),0.0) - 0.12) - 0.002;
    laneMarks = smoothstep(0.004, 0.0, centerLine) * step(0.5, dashPhase);
  }

  // Background stars/particles
  float stars = 0.0;
  for(int i=0; i<20; i++){
    vec2 sp = vec2(hash(vec2(float(i),0.0))-0.5, hash(vec2(float(i),1.0))-0.5);
    sp *= ar;
    stars += smoothstep(0.005, 0.0, length(uv-sp)) * 0.4;
  }

  vec3 red   = vec3(0.91, 0.0, 0.17);
  vec3 white = vec3(0.9, 0.95, 1.0);
  vec3 asphalt = vec3(0.06, 0.06, 0.08);
  vec3 yellow = vec3(1.0, 0.85, 0.0);

  vec3 col = bgCol;
  col += stars * vec3(0.5, 0.5, 0.8) * 0.3;
  // Track asphalt
  col += trackMask * asphalt;
  col += trackEdge * red * 0.3;
  col += laneMarks * white * 0.4;
  // Car
  col += carGlow * red * 0.5;
  col += carMask * red;
  col += streaks * red * 0.6;

  col = clamp(col,0.0,1.0);
  // center fade for readability
  col *= 0.7 + smoothstep(0.0, 0.5, length(uv)) * 0.3;
  // heavy vignette
  float vig = 1.0-smoothstep(0.3,0.9,length(uv*0.8));
  col *= vig * 0.85;

  fragColor = vec4(col,1.0);
}
`

const VERT = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

export default function EeproCTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
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
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h; gl.viewport(0,0,w,h)
      }
      gl.uniform1f(uTime, time*0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(rafRef.current); gl.deleteProgram(prog) }
  }, [active])

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden" style={{ background: 'var(--dark)' }}>
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 font-orbitron text-xs tracking-widest uppercase"
          style={{ border: '1px solid var(--red)', color: 'var(--red)' }}
        >
          <span>🏆</span>
          <span>INSCRIÇÕES ABERTAS</span>
        </div>

        <h2
          className="font-orbitron font-bold mb-6 leading-tight"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', color: 'var(--white)', letterSpacing: '0.05em' }}
        >
          APRENDA A SER UM<br />
          <span style={{ color: 'var(--red)' }}>ENGENHEIRO DE CORRIDA</span>
        </h2>

        <p className="mb-10 text-lg" style={{ color: 'var(--gray)', fontWeight: 300, lineHeight: 1.7 }}>
          O curso EEPRO é o único programa completo de engenharia de corrida do Brasil.
          Aprenda telemetria, setup de carros, análise de dados e muito mais com quem vive o paddock.
        </p>

        <a
          href="https://hotmart.com/pt-br/marketplace/produtos/eepro/J88918686L"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-vibrate inline-block font-orbitron font-bold tracking-widest uppercase px-10 py-4"
          style={{
            background: 'var(--red)',
            color: 'var(--white)',
            fontSize: '0.85rem',
            letterSpacing: '0.3em',
            textDecoration: 'none',
            border: '2px solid var(--red)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          ACESSAR O CURSO EEPRO
        </a>
      </div>
    </section>
  )
}

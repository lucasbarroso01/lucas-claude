import { useEffect, useRef, useCallback } from 'react'

const VERT_SRC = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    console.error('Source:', src)
    gl.deleteShader(shader)
    throw new Error('Shader compile failed')
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, fragSrc: string): WebGLProgram {
  const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  const prog = gl.createProgram()!
  gl.attachShader(prog, vert)
  gl.attachShader(prog, frag)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog))
    throw new Error('Program link failed')
  }
  return prog
}

interface WebGLHook {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  setHover: (v: number) => void
  setMouse: (x: number, y: number) => void
}

export function useWebGL(fragSrc: string, active = true): WebGLHook {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hoverRef = useRef(0)
  const targetHoverRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const rafRef = useRef<number>(0)
  const glRef = useRef<WebGL2RenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)

  const setHover = useCallback((v: number) => { targetHoverRef.current = v }, [])
  const setMouse = useCallback((x: number, y: number) => { mouseRef.current = { x, y } }, [])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false })
    if (!gl) { console.warn('WebGL2 not supported'); return }
    glRef.current = gl

    let program: WebGLProgram
    try {
      program = createProgram(gl, fragSrc)
    } catch {
      return
    }
    programRef.current = program

    gl.useProgram(program)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRes  = gl.getUniformLocation(program, 'u_resolution')
    const uMouse = gl.getUniformLocation(program, 'u_mouse')
    const uHover = gl.getUniformLocation(program, 'u_hover')

    let lastTime = 0
    let lastMouse = performance.now()

    const render = (time: number) => {
      const dt = (time - lastTime) * 0.001
      lastTime = time

      // Lerp hover value smoothly over ~600ms
      const lerpSpeed = dt / 0.6
      hoverRef.current += (targetHoverRef.current - hoverRef.current) * Math.min(lerpSpeed * 3, 1)

      // Resize
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }

      // Throttle uniform updates to 60fps
      const now = performance.now()
      if (now - lastMouse >= 16) {
        lastMouse = now
        gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y)
      }

      gl.uniform1f(uTime, time * 0.001)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uHover, hoverRef.current)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      gl.deleteProgram(program)
      gl.deleteBuffer(buf)
    }
  }, [fragSrc, active])

  return { canvasRef, setHover, setMouse }
}

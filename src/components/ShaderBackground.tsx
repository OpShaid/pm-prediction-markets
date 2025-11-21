import { useEffect, useRef } from 'react'

export function ShaderBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Set canvas size
    const setSize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }
    setSize()

    const resizeObserver = new ResizeObserver(setSize)
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    // Fragment shader - black/gray/white animated gradient
    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;

        // Create flowing pattern
        float pattern = sin(uv.x * 3.0 + time * 0.3) * cos(uv.y * 3.0 + time * 0.2);
        pattern += sin(uv.x * 5.0 - time * 0.4) * cos(uv.y * 5.0 - time * 0.3);
        pattern += sin(length(uv - 0.5) * 8.0 - time * 0.5);
        pattern = pattern / 3.0;

        // Map to black/gray/white range
        float value = (pattern + 1.0) * 0.5;
        value = smoothstep(0.2, 0.8, value);

        // Create noticeable gradient from black to gray/white
        float gray = mix(0.0, 0.6, value);

        gl_FragColor = vec4(vec3(gray), 1.0);
      }
    `

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    // Create program
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'time')
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')

    // Animation loop
    let startTime = Date.now()
    let animationId: number

    const render = () => {
      const time = (Date.now() - startTime) * 0.001
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full rounded-3xl ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

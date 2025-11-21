import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { TrendingUp, Shield, Zap, Users, ArrowRight, Star, Quote } from 'lucide-react'
import gsap from 'gsap'
import { useAuthStore } from '@/store/authStore'

export function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [featuresRef, isFeaturesVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [statsRef, isStatsVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [howItWorksRef] = useIntersectionObserver({ threshold: 0.1 })
  const [testimonialsRef] = useIntersectionObserver({ threshold: 0.1 })

  const sections = ['hero', 'stats', 'features', 'how-it-works', 'testimonials', 'cta']

  const scrollToSection = (index: number) => {
    const section = document.getElementById(sections[index])
    section?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    setSize()
    window.addEventListener('resize', setSize)

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float pattern = sin(uv.x * 3.0 + time * 0.3) * cos(uv.y * 3.0 + time * 0.2);
        pattern += sin(uv.x * 5.0 - time * 0.4) * cos(uv.y * 5.0 - time * 0.3);
        pattern += sin(length(uv - 0.5) * 8.0 - time * 0.5);
        pattern = pattern / 3.0;

        float value = (pattern + 1.0) * 0.5;
        value = smoothstep(0.2, 0.8, value);
        float gray = mix(0.0, 0.6, value);

        gl_FragColor = vec4(vec3(gray), 1.0);
      }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const timeLocation = gl.getUniformLocation(program, 'time')
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')

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
      window.removeEventListener('resize', setSize)
    }
  }, [])

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      const badgeText = document.querySelector('.hero-badge span')
      if (badgeText) {
        const text = badgeText.textContent || ''
        badgeText.innerHTML = text.split('').map(char =>
          `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('')
        gsap.to('.hero-badge .char', {
          opacity: 1,
          duration: 0.1,
          stagger: 0.04,
          ease: 'power2.out',
        })
      }

      const titleSpans = document.querySelectorAll('.hero-title h1 span')
      titleSpans.forEach((span, spanIndex) => {
        const text = span.textContent || ''
        span.innerHTML = text.split('').map(char =>
          `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('')
        gsap.to(span.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          duration: 0.15,
          stagger: 0.03,
          delay: 0.3 + (spanIndex * 0.5),
          ease: 'power2.out',
        })
      })

      const subtitle = document.querySelector('.hero-subtitle')
      if (subtitle) {
        const originalHTML = subtitle.innerHTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = originalHTML

        const processNode = (node: Node): string => {
          if (node.nodeType === Node.TEXT_NODE) {
            return (node.textContent || '').split('').map(char =>
              `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('')
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            const children = Array.from(element.childNodes).map(processNode).join('')
            return `<${element.tagName.toLowerCase()}${Array.from(element.attributes).map(attr => ` ${attr.name}="${attr.value}"`).join('')}>${children}</${element.tagName.toLowerCase()}>`
          }
          return ''
        }

        subtitle.innerHTML = Array.from(tempDiv.childNodes).map(processNode).join('')

        gsap.to('.hero-subtitle .char', {
          opacity: 1,
          duration: 0.08,
          stagger: 0.02,
          delay: 2.0,
          ease: 'power2.out',
        })
      }

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 2.5,
        ease: 'power3.out',
      })

      gsap.from('.hero-indicators > *', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        delay: 3,
        ease: 'power3.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (isFeaturesVisible) {
      gsap.from('.feature-card', {
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      })

      const featureHeading = document.querySelector('.features-heading')
      if (featureHeading && !featureHeading.classList.contains('animated')) {
        featureHeading.classList.add('animated')
        const text = featureHeading.textContent || ''
        featureHeading.innerHTML = text.split('').map(char =>
          `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('')
        gsap.to('.features-heading .char', {
          opacity: 1,
          duration: 0.08,
          stagger: 0.04,
          ease: 'power2.out',
        })
      }

      document.querySelectorAll('.feature-card h3').forEach((heading, index) => {
        if (!heading.classList.contains('animated')) {
          heading.classList.add('animated')
          const text = heading.textContent || ''
          heading.innerHTML = text.split('').map(char =>
            `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
          ).join('')
          gsap.to(heading.querySelectorAll('.char'), {
            opacity: 1,
            duration: 0.06,
            stagger: 0.03,
            delay: 0.3 + (index * 0.15),
            ease: 'power2.out',
          })
        }
      })
    }
  }, [isFeaturesVisible])

  useEffect(() => {
    if (isStatsVisible) {
      gsap.from('.stat-card', {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      })

      document.querySelectorAll('.stat-number').forEach((stat, index) => {
        if (!stat.classList.contains('animated')) {
          stat.classList.add('animated')
          const text = stat.textContent || ''
          stat.innerHTML = text.split('').map(char =>
            `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
          ).join('')
          gsap.to(stat.querySelectorAll('.char'), {
            opacity: 1,
            duration: 0.1,
            stagger: 0.06,
            delay: 0.3 + (index * 0.15),
            ease: 'power2.out',
          })
        }
      })

      document.querySelectorAll('.stat-label').forEach((label, index) => {
        if (!label.classList.contains('animated')) {
          label.classList.add('animated')
          const text = label.textContent || ''
          label.innerHTML = text.split('').map(char =>
            `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
          ).join('')
          gsap.to(label.querySelectorAll('.char'), {
            opacity: 1,
            duration: 0.06,
            stagger: 0.04,
            delay: 0.5 + (index * 0.15),
            ease: 'power2.out',
          })
        }
      })
    }
  }, [isStatsVisible])

  const handleGuestMode = () => {
    const { setGuestMode } = useAuthStore.getState()
    setGuestMode(true)
    window.location.href = '/markets'
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ zoom: 0.7 }}>
      <div id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://t4.ftcdn.net/jpg/09/17/32/77/360_F_917327795_YLhmTQeANcRigtyMjthLfxotWKyK3vzH.jpg)',
            opacity: 0.15
          }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full bg-white/[0.02] backdrop-blur-sm mb-6">
              <Star className="w-4 h-4 text-white" />
              <span className="text-xs font-medium tracking-wide">PREMIUM PREDICTION MARKETS</span>
            </div>

            <div className="hero-title mb-6">
              <h1 className="text-[120px] leading-[0.85] font-black tracking-[-0.04em]">
                <span className="block">PREDICT</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">TRADE</span>
                <span className="block">WIN</span>
              </h1>
            </div>

            <p className="hero-subtitle text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide mb-8">
              Enterprise-grade prediction markets.
              <br />
              Aggregating <span className="text-white font-medium">Kalshi</span> and <span className="text-white font-medium">Polymarket</span> in real-time.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={handleGuestMode}
                className="group h-16 px-12 text-lg bg-white text-black hover:bg-gray-100 font-bold tracking-wide transition-all duration-500 rounded-full"
              >
                START TRADING
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </div>

            <div className="hero-indicators flex items-center justify-center gap-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm text-gray-500 font-light">SECURE</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500 font-light">REAL-TIME</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500 font-light">50K+ TRADERS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div id="stats" ref={statsRef} className="py-24 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card group relative overflow-hidden p-12 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="stat-number text-6xl font-black text-white group-hover:text-black mb-3 tracking-tight transition-colors duration-500">$10M+</div>
                <div className="stat-label text-lg text-gray-400 group-hover:text-black font-light tracking-wider transition-colors duration-500">TOTAL VOLUME</div>
              </div>
            </div>
            <div className="stat-card group relative overflow-hidden p-12 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="stat-number text-6xl font-black text-white group-hover:text-black mb-3 tracking-tight transition-colors duration-500">50K+</div>
                <div className="stat-label text-lg text-gray-400 group-hover:text-black font-light tracking-wider transition-colors duration-500">ACTIVE TRADERS</div>
              </div>
            </div>
            <div className="stat-card group relative overflow-hidden p-12 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="stat-number text-6xl font-black text-white group-hover:text-black mb-3 tracking-tight transition-colors duration-500">1000+</div>
                <div className="stat-label text-lg text-gray-400 group-hover:text-black font-light tracking-wider transition-colors duration-500">MARKETS</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" ref={featuresRef} className="py-24 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="features-heading text-6xl font-black text-white mb-4 tracking-tight">WHY CHOOSE US</h2>
            <p className="text-2xl text-gray-400 font-light max-w-2xl">Built for professionals who demand excellence.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="feature-card group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <TrendingUp className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">REAL-TIME MARKETS</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Lightning-fast execution with instant price updates across all markets.
                </p>
              </div>
            </div>

            <div className="feature-card group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Shield className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">ENTERPRISE SECURITY</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Bank-grade encryption and security protocols protecting your data 24/7.
                </p>
              </div>
            </div>

            <div className="feature-card group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Zap className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">OPTIMIZED ENGINE</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Millisecond trade execution with our proprietary matching engine.
                </p>
              </div>
            </div>

            <div className="feature-card group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Users className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">GLOBAL COMMUNITY</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Join thousands of professional traders making data-driven predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" ref={howItWorksRef} className="py-24 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-6xl font-black text-white mb-4 tracking-tight">HOW IT WORKS</h2>
            <p className="text-2xl text-gray-400 font-light max-w-2xl mx-auto">Start trading in three simple steps.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-black flex items-center justify-center mb-6 transition-colors duration-500">
                  <span className="text-4xl font-black text-white group-hover:text-white">1</span>
                </div>
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">CREATE ACCOUNT</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Sign up in seconds and get instant access to all markets.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-black flex items-center justify-center mb-6 transition-colors duration-500">
                  <span className="text-4xl font-black text-white group-hover:text-white">2</span>
                </div>
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">CHOOSE MARKETS</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Browse 1000+ markets across politics, sports, and more.
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-black flex items-center justify-center mb-6 transition-colors duration-500">
                  <span className="text-4xl font-black text-white group-hover:text-white">3</span>
                </div>
                <h3 className="text-3xl font-bold text-white group-hover:text-black mb-4 tracking-tight transition-colors duration-500">START TRADING</h3>
                <p className="text-lg text-gray-400 group-hover:text-black leading-relaxed font-light transition-colors duration-500">
                  Place trades and watch your predictions come true.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="testimonials" ref={testimonialsRef} className="py-24 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-6xl font-black text-white mb-4 tracking-tight">WHAT TRADERS SAY</h2>
            <p className="text-2xl text-gray-400 font-light max-w-2xl mx-auto">Trusted by thousands of professionals.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Quote className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <p className="text-lg text-gray-300 group-hover:text-black mb-6 leading-relaxed font-light transition-colors duration-500">
                  "Best prediction market platform I've used. Real-time data and seamless execution."
                </p>
                <div className="border-t border-white/10 group-hover:border-black/20 pt-4 transition-colors duration-500">
                  <p className="text-white group-hover:text-black font-bold transition-colors duration-500">Sarah Chen</p>
                  <p className="text-gray-400 group-hover:text-black text-sm transition-colors duration-500">Professional Trader</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Quote className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <p className="text-lg text-gray-300 group-hover:text-black mb-6 leading-relaxed font-light transition-colors duration-500">
                  "Aggregating Kalshi and Polymarket in one place is a game changer for my strategy."
                </p>
                <div className="border-t border-white/10 group-hover:border-black/20 pt-4 transition-colors duration-500">
                  <p className="text-white group-hover:text-black font-bold transition-colors duration-500">Michael Rodriguez</p>
                  <p className="text-gray-400 group-hover:text-black text-sm transition-colors duration-500">Hedge Fund Manager</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden p-10 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md hover:bg-white hover:scale-110 hover:border-white transition-all duration-500 cursor-pointer">
              <div className="relative">
                <Quote className="w-12 h-12 text-white group-hover:text-black mb-6 transition-colors duration-500" />
                <p className="text-lg text-gray-300 group-hover:text-black mb-6 leading-relaxed font-light transition-colors duration-500">
                  "Enterprise-grade security with lightning-fast execution. Exactly what I needed."
                </p>
                <div className="border-t border-white/10 group-hover:border-black/20 pt-4 transition-colors duration-500">
                  <p className="text-white group-hover:text-black font-bold transition-colors duration-500">Emily Johnson</p>
                  <p className="text-gray-400 group-hover:text-black text-sm transition-colors duration-500">Quantitative Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="cta" className="py-24 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden p-20 border border-white/10 rounded-2xl bg-black/80 backdrop-blur-md text-center hover:bg-white hover:scale-105 transition-all duration-500 group cursor-pointer">
            <div className="relative">
              <h2 className="text-6xl font-black text-white group-hover:text-black tracking-tight mb-4 transition-colors duration-500">
                READY TO START?
              </h2>
              <p className="text-2xl text-gray-400 group-hover:text-black max-w-2xl mx-auto font-light leading-relaxed mb-8 transition-colors duration-500">
                Join the future of prediction markets. Start trading today.
              </p>
              <Button
                size="lg"
                onClick={handleGuestMode}
                className="h-16 px-12 text-lg bg-white text-black hover:bg-gray-100 font-bold tracking-wide transition-all duration-500 rounded-full"
              >
                START NOW
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Navigation */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(index)}
            className="w-3 h-3 rounded-full border-2 border-white/50 hover:bg-white hover:scale-150 transition-all duration-300"
            aria-label={`Scroll to ${section}`}
          />
        ))}
      </div>
    </div>
  )
}

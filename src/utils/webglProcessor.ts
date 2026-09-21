import { CameraMode, FilterSettings, LabColor } from '../types';
import { specificityToDeltaEThreshold } from './colorConversion';

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  uniform int u_mirrorX;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    vec2 coord = a_texCoord;
    if (u_mirrorX == 1) {
      coord.x = 1.0 - coord.x;
    }
    v_texCoord = coord;
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec2 u_texSize;
  uniform int u_mode; // 0 = NORMAL, 1 = FIND_COLOR
  uniform vec3 u_targetLab;
  uniform float u_threshold;
  uniform float u_saturation;
  uniform int u_enableSmoothing;

  // sRGB to Linear
  float sRgbToLinear(float c) {
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4);
  }

  vec3 rgbToLinear(vec3 rgb) {
    return vec3(sRgbToLinear(rgb.r), sRgbToLinear(rgb.g), sRgbToLinear(rgb.b));
  }

  // CIE Lab function f(t)
  float labF(float t) {
    float delta = 6.0 / 29.0;
    float deltaCubed = delta * delta * delta;
    return t > deltaCubed ? pow(t, 1.0 / 3.0) : t / (3.0 * delta * delta) + 4.0 / 29.0;
  }

  // Fast RGB to CIELAB in GLSL
  vec3 rgbToLab(vec3 rgb) {
    vec3 lin = rgbToLinear(rgb);
    // Matrix to CIEXYZ (D65)
    float x = lin.r * 0.4124564 + lin.g * 0.3575761 + lin.b * 0.1804375;
    float y = lin.r * 0.2126729 + lin.g * 0.7151522 + lin.b * 0.0721750;
    float z = lin.r * 0.0193339 + lin.g * 0.1191920 + lin.b * 0.9503041;

    // D65 reference white
    float fx = labF(x / 0.95047);
    float fy = labF(y / 1.00000);
    float fz = labF(z / 1.08883);

    float l = clamp(116.0 * fy - 16.0, 0.0, 100.0);
    float a = 500.0 * (fx - fy);
    float b = 200.0 * (fy - fz);

    return vec3(l, a, b);
  }

  // Check if pixel at offset matches target Lab
  float checkMatch(vec2 uv) {
    vec4 c = texture2D(u_image, uv);
    vec3 lab = rgbToLab(c.rgb);
    vec3 diff = lab - u_targetLab;
    float dist = sqrt(dot(diff, diff));
    // Soft transition around threshold
    return 1.0 - smoothstep(u_threshold * 0.88, u_threshold * 1.12, dist);
  }

  void main() {
    vec4 baseColor = texture2D(u_image, v_texCoord);
    vec3 rgb = baseColor.rgb;
    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 gray = vec3(lum);

    if (u_mode == 0) {
      // NORMAL MODE: adjust saturation across entire view
      vec3 satColor = mix(gray, rgb, u_saturation);
      gl_FragColor = vec4(clamp(satColor, 0.0, 1.0), baseColor.a);
      return;
    }

    // FIND_COLOR MODE
    float centerMatch = checkMatch(v_texCoord);
    float finalMatch = centerMatch;

    if (u_enableSmoothing == 1) {
      // 4-cardinal neighbor morphological smoothing with early exit for background pixels:
      // Background pixels (centerMatch <= 0.05) skip neighbor sampling, saving up to 80% of shader instructions!
      if (centerMatch > 0.05) {
        vec2 step = 1.0 / u_texSize;
        float neighborSum = 0.0;
        neighborSum += checkMatch(v_texCoord + vec2(-step.x, 0.0));
        neighborSum += checkMatch(v_texCoord + vec2(step.x,  0.0));
        neighborSum += checkMatch(v_texCoord + vec2(0.0,    -step.y));
        neighborSum += checkMatch(v_texCoord + vec2(0.0,     step.y));

        float neighborAvg = neighborSum * 0.25;

        // If center matches but no neighbors match, it's isolated camera sensor noise -> suppress
        if (centerMatch > 0.5) {
          finalMatch = mix(centerMatch, neighborAvg, 0.35);
          if (neighborAvg < 0.15) {
            finalMatch = 0.0; // Remove single pixel noise speckle
          }
        } else {
          finalMatch = centerMatch;
        }
      }
    }

    // Matching pixels retain original color with saturation boost; non-matching become grayscale
    vec3 coloredPixel = mix(gray, rgb, u_saturation);
    vec3 resultRgb = mix(gray, coloredPixel, clamp(finalMatch, 0.0, 1.0));

    gl_FragColor = vec4(clamp(resultRgb, 0.0, 1.0), baseColor.a);
  }
`;

export class WebglProcessor {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Uniform locations
  private uImageLoc: WebGLUniformLocation | null = null;
  private uTexSizeLoc: WebGLUniformLocation | null = null;
  private uModeLoc: WebGLUniformLocation | null = null;
  private uTargetLabLoc: WebGLUniformLocation | null = null;
  private uThresholdLoc: WebGLUniformLocation | null = null;
  private uSaturationLoc: WebGLUniformLocation | null = null;
  private uEnableSmoothingLoc: WebGLUniformLocation | null = null;
  private uMirrorXLoc: WebGLUniformLocation | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.initGl();
  }

  private initGl(): boolean {
    const gl = this.canvas.getContext('webgl', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      antialias: false,
    });
    if (!gl) {
      console.warn('WebGL not supported, falling back to 2D canvas');
      return false;
    }
    this.gl = gl;

    const vertShader = this.createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = this.createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) return false;

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL Program linking failed:', gl.getProgramInfoLog(program));
      return false;
    }
    this.program = program;

    // Buffer geometry (Full screen quad)
    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    // Texture coords (inverted Y for video orientation)
    this.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    // Create texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Set up vertex attribute bindings once
    gl.useProgram(program);
    const aPosLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    const aTexLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aTexLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, 0, 0);

    // Get Uniforms
    this.uImageLoc = gl.getUniformLocation(program, 'u_image');
    this.uTexSizeLoc = gl.getUniformLocation(program, 'u_texSize');
    this.uModeLoc = gl.getUniformLocation(program, 'u_mode');
    this.uTargetLabLoc = gl.getUniformLocation(program, 'u_targetLab');
    this.uThresholdLoc = gl.getUniformLocation(program, 'u_threshold');
    this.uSaturationLoc = gl.getUniformLocation(program, 'u_saturation');
    this.uEnableSmoothingLoc = gl.getUniformLocation(program, 'u_enableSmoothing');
    this.uMirrorXLoc = gl.getUniformLocation(program, 'u_mirrorX');

    return true;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public render(
    source: TexImageSource,
    width: number,
    height: number,
    mode: CameraMode,
    targetLab: LabColor | null,
    settings: FilterSettings,
    isMirrored: boolean = false
  ) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    const roundW = Math.round(width);
    const roundH = Math.round(height);

    if (this.canvas.width !== roundW || this.canvas.height !== roundH) {
      this.canvas.width = roundW;
      this.canvas.height = roundH;
      gl.viewport(0, 0, roundW, roundH);
    }

    gl.useProgram(this.program);

    // Upload video frame to texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    gl.uniform1i(this.uImageLoc, 0);
    gl.uniform2f(this.uTexSizeLoc, roundW, roundH);
    gl.uniform1i(this.uModeLoc, mode === 'FIND_COLOR' && targetLab ? 1 : 0);
    gl.uniform1i(this.uMirrorXLoc, isMirrored ? 1 : 0);

    if (targetLab) {
      gl.uniform3f(this.uTargetLabLoc, targetLab.l, targetLab.a, targetLab.b);
    } else {
      gl.uniform3f(this.uTargetLabLoc, 0, 0, 0);
    }

    const threshold = specificityToDeltaEThreshold(settings.specificity);
    gl.uniform1f(this.uThresholdLoc, threshold);
    gl.uniform1f(this.uSaturationLoc, settings.saturation);
    gl.uniform1i(this.uEnableSmoothingLoc, settings.morphologicalSmoothing ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  public destroy() {
    if (!this.gl) return;
    if (this.texture) this.gl.deleteTexture(this.texture);
    if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
    if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);
    if (this.program) this.gl.deleteProgram(this.program);
    this.gl = null;
  }
}

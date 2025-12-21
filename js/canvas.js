// Chromatic Aberration Circle Animation - WebGL Shader
function initCanvas() {
    const canvas = document.getElementById('chromaticCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Vertex Shader
    const vsSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment Shader
    const fsSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;

        #define PI 3.14159265359

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution;
            float aspect = u_resolution.x / u_resolution.y;
            
            // Mouse interaction
            vec2 mouse = u_mouse / u_resolution;
            mouse.y = 1.0 - mouse.y; // Flip Y
            
            vec2 pos = st - mouse;
            pos.x *= aspect;

            float d = length(pos);
            
            // Offset black circle by distance z on a rotating circle
            float z = 0.03; // radius of orbit
            float offsetAngle = u_time /2.; // rotation speed
            vec2 offset = vec2(cos(offsetAngle), sin(offsetAngle)) * z;
            vec2 adjustedPos = pos - offset;
            float r = length(adjustedPos);
            float a = atan(pos.y, pos.x);
            
            // Map angle to 0-1
            float t = a / (2.0 * PI) + 0.5;
            
            // Rotate slowly
            t = fract(t + u_time * 0.1);
            
            // Vibrant Rainbow Palette
            // This cosine palette creates smooth, vibrant transitions
            vec3 color = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0) * t + vec3(0.0, 0.33, 0.67)));
           
            // Boost saturation
            color = pow(color, vec3(0.8));
            
            // Create the ring shape with soft edges
            // Inner dark circle
            float inner = smoothstep(0.18, 0.23, r);
            // Outer fade
            float outer = 1.-smoothstep(0.15, 0.3, r);
            
            
            float alpha = inner;
            // alpha = 1.;
            // Add a subtle center glow (purple/blue)
            vec3 centerGlow = vec3(0.2, 0.0, 0.5) * (1.0 - smoothstep(0.0, 0.4, r)) * 0.5;
            
            vec3 finalColor = color * alpha + centerGlow;
            
            // Modulate color based on distance from circle center
            // d > 0.4: white, d < 0.3: existing color, interpolate in between
            float t_blend = smoothstep(0.2, 0.3, d);
            finalColor = mix(finalColor, vec3(0.95), t_blend);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    // Cursor-follow easing: use a two-stage, time-based smoothing.
    const TARGET_TAU = 0.80; // seconds (higher = more delay)
    const FOLLOW_TAU = 0.85; // seconds (higher = slower follow)

    let mouseX = 0;
    let mouseY = 0;
    let rawX = 0;
    let rawY = 0;
    let targetX = 0;
    let targetY = 0;
    let lastTime = 0;

    function smoothTo(current, target, dtSeconds, tauSeconds) {
        if (tauSeconds <= 0) return target;
        const a = 1 - Math.exp(-dtSeconds / tauSeconds);
        return current + (target - current) * a;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        rawX = canvas.width / 2;
        rawY = canvas.height / 2;
        targetX = rawX;
        targetY = rawY;
        if (mouseX === 0 && mouseY === 0) {
            mouseX = rawX;
            mouseY = rawY;
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    document.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        rawX = centerX - (e.clientX - centerX) * 0.2;
        rawY = centerY - (e.clientY - centerY) * 0.2;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            rawX = centerX - (e.touches[0].clientX - centerX) * 0.2;
            rawY = centerY - (e.touches[0].clientY - centerY) * 0.2;
        }
    });

    function render(time) {
        const t = time * 0.001;
        const dt = lastTime ? Math.min(0.05, (time - lastTime) * 0.001) : 0;
        lastTime = time;

        targetX = smoothTo(targetX, rawX, dt, TARGET_TAU);
        targetY = smoothTo(targetY, rawY, dt, TARGET_TAU);

        mouseX = smoothTo(mouseX, targetX, dt, FOLLOW_TAU);
        mouseY = smoothTo(mouseY, targetY, dt, FOLLOW_TAU);

        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(mouseLocation, mouseX, mouseY);
        gl.uniform1f(timeLocation, t);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvas);
} else {
    initCanvas();
}

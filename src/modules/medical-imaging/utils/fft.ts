export class FFT {
    // 1D FFT (Cooley-Tukey)
    // real and imag are arrays of size n (must be power of 2)
    static fft1D(real: Float32Array, imag: Float32Array) {
        const n = real.length;
        if (n <= 1) return;

        // Bit-reverse copy
        let j = 0;
        for (let i = 0; i < n; i++) {
            if (i < j) {
                const tr = real[i]; real[i] = real[j]; real[j] = tr;
                const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
            }
            let m = n >> 1;
            while (m >= 1 && j >= m) {
                j -= m;
                m >>= 1;
            }
            j += m;
        }

        // Butterflies
        for (let s = 1; s < n; s <<= 1) { // s = step size (1, 2, 4...)
            const angle = -Math.PI / s;
            const w_real = Math.cos(angle);
            const w_imag = Math.sin(angle);

            for (let j = 0; j < n; j += (s << 1)) {
                let wr = 1.0;
                let wi = 0.0;
                for (let k = 0; k < s; k++) {
                    const evenIndex = j + k;
                    const oddIndex = j + k + s;

                    // t = w * odd
                    const tr = wr * real[oddIndex] - wi * imag[oddIndex];
                    const ti = wr * imag[oddIndex] + wi * real[oddIndex];

                    // u = even
                    const ur = real[evenIndex];
                    const ui = imag[evenIndex];

                    // even = u + t
                    real[evenIndex] = ur + tr;
                    imag[evenIndex] = ui + ti;

                    // odd = u - t
                    real[oddIndex] = ur - tr;
                    imag[oddIndex] = ui - ti;

                    // update w
                    const w_temp = wr * w_real - wi * w_imag;
                    wi = wr * w_imag + wi * w_real;
                    wr = w_temp;
                }
            }
        }
    }

    // 1D Inverse FFT
    static ifft1D(real: Float32Array, imag: Float32Array) {
        // Conjugate input
        for (let i = 0; i < real.length; i++) imag[i] = -imag[i];

        // Forward FFT
        this.fft1D(real, imag);

        // Conjugate output and scale
        const n = real.length;
        for (let i = 0; i < n; i++) {
            imag[i] = -imag[i] / n;
            real[i] = real[i] / n;
        }
    }

    // 2D FFT
    // width and height must be powers of 2
    static fft2D(real: Float32Array, imag: Float32Array, width: number, height: number) {
        // Rows
        for (let y = 0; y < height; y++) {
            const rowR = new Float32Array(width);
            const rowI = new Float32Array(width);
            for (let x = 0; x < width; x++) {
                rowR[x] = real[y * width + x];
                rowI[x] = imag[y * width + x];
            }
            this.fft1D(rowR, rowI);
            for (let x = 0; x < width; x++) {
                real[y * width + x] = rowR[x];
                imag[y * width + x] = rowI[x];
            }
        }

        // Columns
        for (let x = 0; x < width; x++) {
            const colR = new Float32Array(height);
            const colI = new Float32Array(height);
            for (let y = 0; y < height; y++) {
                colR[y] = real[y * width + x];
                colI[y] = imag[y * width + x];
            }
            this.fft1D(colR, colI);
            for (let y = 0; y < height; y++) {
                real[y * width + x] = colR[y];
                imag[y * width + x] = colI[y];
            }
        }
    }

    // 2D Inverse FFT
    static ifft2D(real: Float32Array, imag: Float32Array, width: number, height: number) {
        // Rows
        for (let y = 0; y < height; y++) {
            const rowR = new Float32Array(width);
            const rowI = new Float32Array(width);
            for (let x = 0; x < width; x++) {
                rowR[x] = real[y * width + x];
                rowI[x] = imag[y * width + x];
            }
            this.ifft1D(rowR, rowI);
            for (let x = 0; x < width; x++) {
                real[y * width + x] = rowR[x];
                imag[y * width + x] = rowI[x];
            }
        }

        // Columns
        for (let x = 0; x < width; x++) {
            const colR = new Float32Array(height);
            const colI = new Float32Array(height);
            for (let y = 0; y < height; y++) {
                colR[y] = real[y * width + x];
                colI[y] = imag[y * width + x];
            }
            this.ifft1D(colR, colI);
            for (let y = 0; y < height; y++) {
                real[y * width + x] = colR[y];
                imag[y * width + x] = colI[y];
            }
        }
    }

    static shift(data: Float32Array, width: number, height: number): Float32Array {
        const out = new Float32Array(data.length);
        const halfW = width / 2;
        const halfH = height / 2;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const newX = (x + halfW) % width;
                const newY = (y + halfH) % height;
                out[newY * width + newX] = data[y * width + x];
            }
        }
        return out;
    }
}

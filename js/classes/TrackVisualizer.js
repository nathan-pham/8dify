export default class TrackVisualizer {
    constructor(track, container) {
        this.track = track;
        this.container = container;

        this.animationId = 0;

        this.createCanvas();
    }

    get size() {
        return {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
        };
    }

    createCanvas() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        Object.assign(this.canvas, this.size);

        this.container.appendChild(this.canvas);
    }

    play() {
        const bufferLength = this.track.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = this.size.width / bufferLength;

        const ctx = this.ctx;

        const animate = () => {
            // update bars
            this.track.analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, this.size.width, this.size.height);
            ctx.fillStyle = "#000";

            // render left bars
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / this.size.height) * 3;

                ctx.fillRect(
                    this.size.width / 2 + x,
                    this.size.height - barHeight,
                    barWidth,
                    barHeight
                );

                x += barWidth;
            }

            // render right bars
            x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / this.size.height) * 3;

                ctx.fillRect(
                    this.size.width / 2 - x,
                    this.size.height - barHeight,
                    barWidth,
                    barHeight
                );

                x += barWidth;
            }

            this.animationId = window.requestAnimationFrame(animate);
        };

        animate();
    }

    pause() {
        cancelAnimationFrame(this.animationId);
    }

    // const bufferLength = analyser.frequencyBinCount;
    // const dataArray = new Uint8Array(bufferLength);
    // const barWidth = canvas.width / bufferLength;
}

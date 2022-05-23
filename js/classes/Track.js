import TrackVisualizer from "./TrackVisualizer.js";

export default class Track {
    name = "Untitled Track";
    audio = null;
    cover = "";

    constructor(props) {
        Object.assign(this, props);

        this.formatName();
        this.activateStereo();
    }

    formatName() {
        this.name = this.name.split(".").shift();
    }

    activateStereo() {
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaElementSource(this.audio);
        const analyserNode = audioContext.createAnalyser();
        const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });

        audioSource
            .connect(stereoNode)
            .connect(analyserNode)
            .connect(audioContext.destination);

        analyserNode.fftSize = 128;

        this.analyser = analyserNode;
        this.stereo = stereoNode;
    }

    activateVisualizer(container) {
        this.visualizer = new TrackVisualizer(this, container);
    }

    get duration() {
        return this.audio.duration || 0;
    }

    static formatTime(duration) {
        const minutes = Math.floor(duration / 60);
        const seconds = duration - minutes * 60;

        const pad = (n) => Math.floor(n).toString().padStart(2, "0");

        return `${pad(minutes)}:${pad(seconds)}`;
    }

    play() {
        this.audio.play();
        this.visualizer?.play();
    }

    pause() {
        this.audio.pause();
        this.visualizer?.pause();
    }
}

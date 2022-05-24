import TrackVisualizer from "./TrackVisualizer.js";
import { $ } from "../utils/query.js";

export default class Track {
    name = "Untitled Track";
    audio = null;
    cover = "";
    url = "";

    constructor(props) {
        Object.assign(this, props);

        this.activateStereo();
        this.initEventListeners();
    }

    initEventListeners() {
        this.onTimeUpdateCb = () => {};
        this.onEndCb = () => {};

        // add event listeners
        // prettier-ignore
        this.audio.addEventListener("timeupdate", (e) => this.onTimeUpdateCb(e));
        this.audio.addEventListener("ended", (e) => this.onEndCb(e));

        window.addEventListener("beforeunload", () => {
            URL.revokeObjectURL(this.url);
        });
    }

    onTimeUpdate(cb) {
        this.onTimeUpdateCb = cb;
    }

    onEnd(cb) {
        this.onEndCb = cb;
    }

    activateStereo() {
        try {
            const audioContext = new AudioContext();
            const audioSource = audioContext.createMediaElementSource(
                this.audio
            );
            const analyserNode = audioContext.createAnalyser();
            const stereoNode = new StereoPannerNode(audioContext, { pan: 0 });

            audioSource
                .connect(stereoNode)
                .connect(analyserNode)
                .connect(audioContext.destination);

            analyserNode.fftSize = 128;

            this.analyser = analyserNode;
            this.stereo = stereoNode;
        } catch (e) {}
    }

    activateVisualizer(container) {
        this.visualizer = new TrackVisualizer(this, container);
    }

    get duration() {
        return this.audio.duration || 0;
    }

    get playing() {
        return !this.audio.paused;
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

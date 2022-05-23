import TrackVisualizer from "./TrackVisualizer.js";
import { $ } from "../utils/query.js";

export default class Track {
    name = "Untitled Track";
    audio = null;
    cover = "";

    constructor(props) {
        Object.assign(this, props);

        this.activateStereo();

        this.onTimeUpdateCb = () => {};
        this.audio.addEventListener("timeupdate", (e) => {
            this.onTimeUpdateCb(e);
        });
    }

    onTimeUpdate(cb) {
        this.onTimeUpdateCb = cb;
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

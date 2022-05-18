export default class Track {
    name = "Untitled Track";
    audio = null;
    cover = "";

    constructor(props) {
        Object.assign(this, props);
    }

    get duration() {
        return this.audio.duration || 0;
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }
}

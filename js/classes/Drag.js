import { $ } from "../utils/query.js";
import Track from "./Track.js";

// export Drag component logic
export default class Drag {
    constructor({ element }) {
        this.element = $(element);
        this.tracks = [];

        this.onCompleteCb = () => {};

        this.addEventListeners();
    }

    addEventListeners() {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            this.element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();

                return false;
            });
        });

        ["dragenter", "dragover"].forEach((eventName) => {
            this.element.addEventListener(eventName, () => {
                this.element.classList.add("drag-highlight");
            });
        });

        ["dragleave", "drop"].forEach((eventName) => {
            this.element.addEventListener(eventName, () => {
                this.element.classList.remove("drag-highlight");
            });
        });

        this.element.addEventListener("drop", (e) => {
            this.handleFiles(e.dataTransfer.files);
        });

        $("#drag__form__input").addEventListener("change", (e) => {
            this.handleFiles(e.target.files);
            $("#drag__form__input").value = "";
        });
    }

    static async fileToTrack(file) {
        const url = URL.createObjectURL(file);
        const cover = await Drag.getCover();
        const audio = new Audio(url);

        return new Promise((resolve, reject) => {
            audio.addEventListener("canplaythrough", () => {
                URL.revokeObjectURL(url);

                resolve(
                    new Track({
                        name: file.name,
                        cover,
                        audio,
                    })
                );
            });

            audio.addEventListener("error", () => {
                URL.revokeObjectURL(url);
                reject(new Error("Error loading audio"));
            });
        });
    }

    static async getCover() {
        return fetch("https://source.unsplash.com/500x500/?future").then(
            (res) => res.url
        );
    }

    async handleFiles(files) {
        for (const file of files) {
            this.tracks.push(await Drag.fileToTrack(file));
        }

        this.onCompleteCb();
    }

    onComplete(cb) {
        this.onCompleteCb = cb;
    }
}

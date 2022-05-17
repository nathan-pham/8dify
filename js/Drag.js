import { $ } from "./utils/query.js";

// export Drag component logic
export default class Drag {
    constructor(selector) {
        this.element = $(selector);

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
            const file = e.dataTransfer.files[0];
            file && this.handleFile(file);
        });

        $("#drag__form__input").addEventListener("change", (e) => {
            const file = e.target.files[0];
            file && this.handleFile(file);

            $("#drag__form__input").value = "";
        });
    }

    static fileToAudio(file) {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);

        audio.volume = 1;
        audio.addEventListener("load", () => URL.revokeObjectURL(url));

        return audio;
    }

    handleFile(file) {
        const audio = Drag.fileToAudio(file);
        audio.play();
    }
}

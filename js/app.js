import Drag from "./classes/Drag.js";
import Track from "./classes/Track.js";

import { $, $$ } from "./utils/query.js";

import gsap from "https://esm.sh/gsap";

const state = {
    currentTab: null,

    tracks: [],
    currentTrack: 0,
};

const navigateTo = (newTab) => {
    const initialState = {
        scale: 0,
        opacity: 0,
    };

    const animateNewTab = () => {
        // set new tab & animate it in
        tabs[newTab].classList.add("app-tab");
        app[newTab]();

        gsap.fromTo(tabs[newTab], initialState, {
            scale: 1,
            opacity: 1,
            ease: "expo.inOut",
        });

        state.currentTab = newTab;
    };

    if (tabs.hasOwnProperty(state.currentTab)) {
        gsap.to(tabs[state.currentTab], {
            ...initialState,
            ease: "expo.inOut",
            onComplete: () => {
                // reset old tab
                tabs[state.currentTab].classList.remove("app-tab");
                tabs[state.currentTab].style = "";

                animateNewTab();
            },
        });
    } else {
        animateNewTab();
    }
};

const tabs = {
    drag: $(".app__drag"),
    music: $(".app__music"),
};

const app = {
    drag: () => {
        const dragComponent = new Drag({ element: ".drag" });

        dragComponent.onComplete(() => {
            state.tracks = dragComponent.tracks;
            navigateTo("music");
        });
    },

    music: () => {
        const currentTrack = state.tracks[state.currentTrack];

        $(tabs.music, ".track__cd img").src = currentTrack.cover;
        $(tabs.music, ".track__title").textContent = currentTrack.name;

        const times = $$(tabs.music, ".track__time time");
        times[1].textContent = Track.formatTime(currentTrack.duration);

        state.tracks.forEach((track) => {
            track.audio.addEventListener("timeupdate", (e) => {
                const time = e.target.currentTime;

                times[0].textContent = Track.formatTime(time);
                track.stereo.pan.value = Math.sin(time / Math.PI);
            });

            track.activateVisualizer($(tabs.music, ".track__sound"));
        });

        currentTrack.play();
    },
};

navigateTo("drag");

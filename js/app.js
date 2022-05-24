import Drag from "./classes/Drag.js";
import Track from "./classes/Track.js";

import { $, $$ } from "./utils/query.js";
import * as icons from "./libs/icons.js";

import gsap from "https://esm.sh/gsap";
import Sortable from "https://esm.sh/sortablejs";

const state = {
    currentTab: null,

    tracks: [],
    currentTrack: 0,

    menuOpen: false,
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
        // update track
        const times = $$(tabs.music, ".track__time time");

        // add event listeners to tracks
        state.tracks.forEach((track) => {
            track.activateVisualizer($(tabs.music, ".track__sound"));

            track.onTimeUpdate((e) => {
                const time = e.target.currentTime;

                times[0].textContent = Track.formatTime(time);
                track.stereo.pan.value = Math.sin(time / Math.PI);
            });

            track.onEnd(() => {
                state.tracks[state.currentTrack].pause();
                state.currentTrack =
                    (state.currentTrack + 1) % state.tracks.length;
                updateTrack();
            });
        });

        // update dom
        const updateTrack = () => {
            const currentTrack = state.tracks[state.currentTrack];

            $(tabs.music, ".track__cd img").src = currentTrack.cover;
            $(tabs.music, ".track__title").textContent = currentTrack.name;

            times[1].textContent = Track.formatTime(currentTrack.duration);

            currentTrack.play();
        };

        updateTrack();

        // menu toggle
        const menuToggle = $(tabs.music, ".menu__toggle");
        const menuTracks = $(tabs.music, ".menu__content__tracks");
        menuTracks.innerHTML = state.tracks
            .map(({ name }) => `<li>${icons.handle} ${name}</li>`)
            .join("");

        new Sortable(menuTracks, {
            handle: ".menu__content__tracks > li > svg", // handle's class
            animation: 150,
            onEnd: (e) => {
                const items = [...e.to.children].map((el) => el.textContent);

                state.tracks = [...state.tracks].sort(
                    (trackA, trackB) =>
                        items.indexOf(trackA.name) - items.indexOf(trackB.name)
                );

                console.log(items, state.tracks);
            },
        });

        const manageMenu = () => {
            state.menuOpen = !state.menuOpen;

            const styles = getComputedStyle(menuToggle);
            const toggleSize = styles.getPropertyValue("--toggle-size");
            const menuMargin = styles.getPropertyValue("--menu-margin");

            if (state.menuOpen) {
                menuToggle.style.transform = "rotate(180deg)";
                $(".screen").classList.add("screen-bg");

                gsap.to(".menu", {
                    // prettier-ignore
                    top: `calc(100vh - ${menuMargin} - ${$(".menu").offsetHeight}px)`,
                    ease: "expo.inOut",
                    delay: 0.1,
                });
            } else {
                menuToggle.style.transform = "rotate(0)";
                $(".screen").classList.remove("screen-bg");

                gsap.to(".menu", {
                    top: `calc(100vh - ${toggleSize} - ${menuMargin})`,
                    ease: "expo.inOut",
                    delay: 0.1,
                });
            }
        };

        gsap.from(menuToggle, { y: 100, ease: "expo.inOut", delay: 0.5 });
        $(".screen").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (
                e.target === menuToggle ||
                (e.target === $(".screen") && state.menuOpen)
            ) {
                manageMenu();
            }

            return false;
        });

        // menu options
        const [backwardsOption, pauseOption, forwardsOption] = $$(
            tabs.music,
            ".controls__icon"
        );

        // backwards
        backwardsOption.addEventListener("click", () => {
            const currentTrack = state.tracks[state.currentTrack];

            currentTrack.audio.currentTime -= 10;
            currentTrack.visualizer.rotate -= 10;
        });

        // play/pause
        pauseOption.addEventListener("click", () => {
            const currentTrack = state.tracks[state.currentTrack];

            if (currentTrack.playing) {
                currentTrack.pause();
                pauseOption.innerHTML = icons.play;
            } else {
                currentTrack.play();
                pauseOption.innerHTML = icons.pause;
            }
        });

        // forwards
        forwardsOption.addEventListener("click", () => {
            const currentTrack = state.tracks[state.currentTrack];

            currentTrack.audio.currentTime += 10;
            currentTrack.visualizer.rotate += 10;
        });
    },
};

navigateTo("drag");

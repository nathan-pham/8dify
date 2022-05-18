import Drag from "./classes/Drag.js";

import { $ } from "./utils/query.js";

import gsap from "https://esm.sh/gsap";

let currentTab;

const dragComponent = new Drag({ element: ".drag" });

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

        currentTab = newTab;
    };

    if (tabs.hasOwnProperty(currentTab)) {
        gsap.to(tabs[currentTab], {
            ...initialState,
            ease: "expo.inOut",
            onComplete: () => {
                // reset old tab
                tabs[currentTab].classList.remove("app-tab");
                tabs[currentTab].style = "";

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
        dragComponent.onComplete(() => {
            navigateTo("music");
        });
    },

    music: () => {
        $(tabs.music, ".track__cd img").src = dragComponent.tracks[0].cover;
    },
};

navigateTo("drag");

export const $ = (parent, selector) => {
    return parent && selector
        ? parent.querySelector(selector)
        : document.body.querySelector(parent);
};

export const $$ = (parent, selector) => {
    return [
        ...(parent && selector
            ? parent.querySelectorAll(selector)
            : document.body.querySelectorAll(parent)),
    ];
};

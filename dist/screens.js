"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screen = exports.createFromTemplate = void 0;
function createFromTemplate(id, data) {
    const template = document.getElementById(id);
    if (template == null)
        return null;
    const clone = template.content.cloneNode(true);
    for (const dataKey in data) {
        if (!data.hasOwnProperty(dataKey))
            continue;
        const value = data[dataKey];
        const element = clone.querySelector(`[data-value="${dataKey}"]`);
        if (element != null) {
            if (element instanceof HTMLInputElement) {
                element.value = value;
            }
            else {
                element.innerHTML = value;
            }
        }
    }
    return clone;
}
exports.createFromTemplate = createFromTemplate;
exports.Screen = {
    setData: function (name, key, realValue) {
        const screen = document.querySelector(`.screen[data-name="${name}"]`);
        if (screen !== null) {
            const value = screen.querySelector(`[data-value="${key}"]`);
            if (value != null) {
                const valueName = value.getAttribute('data-value');
                if (valueName !== null) {
                    if (value instanceof HTMLInputElement) {
                        value.value = realValue;
                    }
                    else {
                        value.innerHTML = realValue;
                    }
                }
            }
        }
    },
    set: function (name, data = {}) {
        exports.Screen.clear();
        const screen = document.querySelector(`.screen[data-name="${name}"]`);
        if (screen !== null) {
            screen.classList.remove('screen--hidden');
            const values = screen.querySelectorAll('[data-value]');
            if (values.length > 0) {
                for (let i = 0; i < values.length; i++) {
                    const value = values[i];
                    const valueName = value.getAttribute('data-value');
                    if (valueName !== null && data.hasOwnProperty(valueName)) {
                        const realValue = data[valueName];
                        if (value instanceof HTMLInputElement) {
                            value.value = realValue;
                        }
                        else {
                            value.innerHTML = realValue;
                        }
                    }
                }
            }
        }
    },
    clear: function () {
        const screens = document.querySelectorAll('.screen:not(.screen--hidden)');
        for (let i = 0; i < screens.length; i++) {
            const screen = screens[i];
            screen.classList.add('screen--hidden');
        }
    }
};
//# sourceMappingURL=screens.js.map
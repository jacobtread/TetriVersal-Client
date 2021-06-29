export function createFromTemplate(id: string, data: any): Element {
    const template: Element | null = document.getElementById(id);
    if (template == null) return null;
    const clone: Element = (template as HTMLTemplateElement).content.cloneNode(true) as Element;
    for (const dataKey in data) {
        if (!data.hasOwnProperty(dataKey)) continue;
        const value = data[dataKey];
        const element: Element | null = clone.querySelector(`[data-value="${dataKey}"]`)
        if (element != null) {
            if (element instanceof HTMLInputElement) {
                element.value = value
            } else {
                element.innerHTML = value
            }
        }
    }
    return clone;
}


export const Screen = {
    setData: function (name, key, realValue) {
        const screen: Element | null = document.querySelector(`.screen[data-name="${name}"]`);
        if (screen !== null) {
            const value: Element = screen.querySelector(`[data-value="${key}"]`)
            if (value != null) {
                const valueName: string | null = value.getAttribute('data-value');
                if (valueName !== null) {
                    if (value instanceof HTMLInputElement) {
                        value.value = realValue
                    } else {
                        value.innerHTML = realValue
                    }
                }
            }
        }
    },
    set: function (name: string, data: any = {}) {
        Screen.clear()
        const screen: Element | null = document.querySelector(`.screen[data-name="${name}"]`);
        if (screen !== null) {
            screen.classList.remove('screen--hidden');
            const values: NodeListOf<Element> = screen.querySelectorAll('[data-value]')
            if (values.length > 0) {
                for (let i = 0; i < values.length; i++) {
                    const value: Element = values[i];
                    const valueName: string | null = value.getAttribute('data-value');
                    if (valueName !== null && data.hasOwnProperty(valueName)) {
                        const realValue: string = data[valueName];
                        if (value instanceof HTMLInputElement) {
                            value.value = realValue
                        } else {
                            value.innerHTML = realValue
                        }
                    }
                }
            }
        }
    },
    clear: function () {
        const screens: NodeListOf<Element> = document.querySelectorAll('.screen:not(.screen--hidden)');
        for (let i = 0; i < screens.length; i++) {
            const screen: Element = screens[i];
            screen.classList.add('screen--hidden');
        }
    }
}
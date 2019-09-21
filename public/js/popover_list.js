
export default class PopoverList {
    /**
     * Create a new popover list
     * @param {string} id The id of the outer popover list element
     * @param {object} options The options for the popover list
     *
     */
    constructor(id, options) {
        this.id = id;
        this.options = options;
        this.hidden = true;

        this.options.offset = this.options.offset || 0;
        this.options.placement = this.options.placement || "right";
        this.options.trigger = this.options.trigger || "click";
        this.options.delay = this.options.delay || 300;

        this.main = null;
    }

    /**
     * Create the needed elements for the popover list
     */
    draw(parent) {
        parent.insertAdjacentHTML("beforeend", `
            <a tabindex="0" id="${this.id}" class="popover-list-source">
                ${this.draw_icon(this.options.icon, this.options.icon_size, this.options.icon_color_class)}
                ${(this.options.text) ? '<span>' + this.options.text + '</span>' : ""}
            </a>
            <div id="${this.id}-popover" class="popover-list-div" style="opacity: 0">
                <div class="popover-arrow popover-placement-${this.options.placement || "right"}"></div>
                ${this.draw_list()}
            </div>
        `);

        this.main = document.querySelector(`#${this.id}`);
        this.main.addEventListener("click", (e) => {
            if (this.options.trigger === "focus" && this.hidden) {
                this.main.focus();
            }

            this.toggle();
        });

        if (this.options.trigger === "focus") {
            this.main.addEventListener("focusout", (e) => {
                e.preventDefault();
                if (!this.hidden) {
                    this.toggle();
                }
            });
        }

        // add callbacks
        let elements = document.querySelectorAll(`#${this.id}-popover ul li`);
        for (let i=0; i<elements.length; i++) {
            if (this.options.children[i].callback !== undefined) {
                elements[i].addEventListener("click", (event) => {
                    this.options.children[i].callback(event);
                    this.toggle();
                });
            }
        }
    }
    
    draw_list() {
        let items = [];

        if (this.options.title) {
            items.push(`<div class="header"><a>${this.options.title}</a></div>`);
        }

        items.push(`<ul class="popover-list">`);
        this.options.children.forEach(child => {
            items.push(`
                <li class="popover-list-item ${(child.disabled === true) ? "disabled" : ""}">                    
                    ${this.draw_icon(child.icon, child.icon_size, child.icon_color_class)}
                    ${(child.text !== undefined) ? '<a>' + child.text + '</a>' : ""}
                </li>
            `);
        });
        items.push(`</ul>`);

        return items.join("");
    }

    draw_icon(icon, size, color) {
        return `<i class="fas fa-${icon} fa-${size || 1}x ${color || "popover-icon"}"></i>`;
    }

    toggle() {
        let parent = this.main;
        let popover = document.querySelector(`#${this.id}-popover`);
        let arrow = document.querySelector(`#${this.id}-popover .popover-arrow`);

        let as = 12;

        if (this.hidden) {
            let parent_bounds = parent.getBoundingClientRect();
            let popover_bounds = popover.getBoundingClientRect();

            if (this.options.placement === "right") {
                popover.style.top = parent_bounds.y + ((parent_bounds.height / 2) - (popover_bounds.height / 2)) + "px";
                popover.style.left = parent_bounds.x + (parent_bounds.width + as + this.options.offset) + "px";
                arrow.style.top = (popover_bounds.height / 2) - as + "px";
            } else if (this.options.placement === "left") {
                popover.style.top = parent_bounds.y + ((parent_bounds.height / 2) - (popover_bounds.height / 2)) + "px";
                popover.style.left = parent_bounds.x - (popover_bounds.width + as + this.options.offset) + "px";
                arrow.style.top = (popover_bounds.height / 2) - as + "px";
            } else if (this.options.placement === "top") {
                popover.style.top = parent_bounds.y - popover_bounds.height - (as + this.options.offset) + "px";
                popover.style.left = parent_bounds.x - (popover_bounds.width / 2) + (parent_bounds.width / 2) + "px";
                arrow.style.left = (popover_bounds.width / 2) - as + "px";
            } else {
                popover.style.top = parent_bounds.y + parent_bounds.height + (as + this.options.offset) + "px";
                popover.style.left = parent_bounds.x - (popover_bounds.width / 2) + (parent_bounds.width / 2) + "px";
                arrow.style.left = (popover_bounds.width / 2) - as + "px";
            }

            this.transition(popover, "opacity", this.options.delay, 0, 1, () => {
                console.log("done");
            });
        } else {
            this.transition(popover, "opacity", this.options.delay, 1, 0, () => {
                console.log("done");
            })
        }

        this.hidden = !this.hidden;
    }

    /**
     * Transition a style property
     * @param element The element whose style to change
     * @param property The property to change
     * @param duration The amount of time that the transition should last for
     * @param start The start value
     * @param stop The end value
     * @param callback The callback to make when the transition is done
     * @param suffix The suffix, can be used for units like `px`, `em`, `%`
     * @param steps The number of steps, increase for smoothness
     */
     transition(element, property, duration, start, stop, callback=null, suffix="", steps=10) {
        let start_time = Date.now();
        let end_time = start_time + duration;
        this.transition_recur(
            (x) => {  // setter
                element.style[property] = x + suffix;
            },
            () => {  // getter for next value based on time
                let x = Date.now();
                return (x - start_time) * (stop - start) / (end_time - start_time) + start;
            },
            (x) => {  // determine if we need to continue
                return (start < stop && x < stop) || (start > stop && x > stop);
            },
            duration / steps,
            callback
        );
    }

    transition_recur(setter, getter, continue_checker, timeout, callback) {
        let x = getter();
        setter(x);

        if (continue_checker(x)) {
            setTimeout(
                () => { this.transition_recur(setter, getter, continue_checker, timeout, callback) },
                timeout
            );
        } else if (callback !== null) {
            callback();
        }
    }
}
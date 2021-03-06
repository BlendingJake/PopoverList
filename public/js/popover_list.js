/* eslint-disable indent */
/* eslint-disable space-before-function-paren */

export default class PopoverList {
    /**
     * Create a new popover list
     * @param {string} id The id of the outer popover list element
     * @param {object} options The options for the popover list
     * @param {Element} parent The parent element to add the popover list to
     */
    constructor(id, options, parent) {
        this.id = id
        this.options = options
        this.hidden = true
        this.parent = parent

        this.options.offset = this.options.offset || 0
        this.options.placement = this.options.placement || 'right'
        this.options.trigger = this.options.trigger || 'click'
        this.options.delay = this.options.delay || 300

        this.main = null
        this.draw()
    }

    /**
       * Create the needed elements for the popover list
       */
    draw() {
        this.parent.insertAdjacentHTML('beforeend', `
            <a tabindex="0" id="${this.id}" class="popover-list-source">
                ${(this.options.icon !== undefined) ? this.drawIcon(this.options.icon, this.options.icon_size, this.options.icon_color_class) : ''}
                ${(this.options.text) ? '<span>' + this.options.text + '</span>' : ''}
            </a>
            <div id="${this.id}-popover" class="popover-list-div" style="opacity: 0">
                <div class="popover-arrow popover-placement-${this.options.placement || 'right'}"></div>
                ${this.drawList()}
            </div>
        `)

        this.main = document.querySelector(`#${this.id}`)
        this.main.addEventListener('click', (e) => {
            if (this.options.trigger === 'focus' && this.hidden) {
                this.main.focus()
            }

            this.toggle()
        })
        this.main.addEventListener('show', (e) => {
            if (this.hidden) {
                this.toggle()
            }

            e.stopPropagation()
        })
        this.main.addEventListener('hide', (e) => {
            if (!this.hidden) {
                this.toggle()
            }

            e.stopPropagation()
        })

        if (this.options.trigger === 'focus') {
            this.main.addEventListener('focusout', (e) => {
                e.preventDefault()
                if (!this.hidden) {
                    this.toggle()
                }
            })
        }

        // add callbacks
        const elements = document.querySelectorAll(`#${this.id}-popover ul li`)
        for (let i = 0; i < elements.length; i++) {
            if (this.options.children[i].disabled === false && this.options.children[i].callback !== undefined) {
                elements[i].addEventListener('click', (event) => {
                    this.options.children[i].callback(event)
                    this.toggle()
                })
            }
        }
    }

    drawList() {
        const items = []

        if (this.options.title) {
            items.push(`<div class="header"><a>${this.options.title}</a></div>`)
        }

        items.push('<ul class="popover-list">')
        this.options.children.forEach(child => {
            items.push(`
                <li class="popover-list-item ${(child.disabled === true) ? 'disabled' : ''}" style="${(child.center === true) ? 'text-align: center;' : ''}">                    
                    ${(child.icon !== undefined) ? this.drawIcon(child.icon, child.icon_size, child.icon_color_class) : ''}
                    ${(child.text !== undefined) ? '<a>' + child.text + '</a>' : ''}
                </li>
            `)
        })
        items.push('</ul>')

        return items.join('')
    }

    drawIcon(icon, size, color) {
        return `<i class="fas fa-${icon} fa-${size || 1}x ${color || 'popover-icon'}"></i>`
    }

    toggle() {
        const parent = this.main
        const popover = document.querySelector(`#${this.id}-popover`)
        const arrow = document.querySelector(`#${this.id}-popover .popover-arrow`)

        const as = 12 // arrow spacing

        if (this.hidden) {
            const parentBounds = parent.getBoundingClientRect()
            const popoverBounds = popover.getBoundingClientRect()

            if (this.options.placement === 'right') {
                popover.style.top = parentBounds.y + ((parentBounds.height / 2) - (popoverBounds.height / 2)) + 'px'
                popover.style.left = parentBounds.x + (parentBounds.width + as + this.options.offset) + 'px'
                arrow.style.top = (popoverBounds.height / 2) - as + 'px'
            } else if (this.options.placement === 'left') {
                popover.style.top = parentBounds.y + ((parentBounds.height / 2) - (popoverBounds.height / 2)) + 'px'
                popover.style.left = parentBounds.x - (popoverBounds.width + as + this.options.offset) + 'px'
                arrow.style.top = (popoverBounds.height / 2) - as + 'px'
            } else if (this.options.placement === 'top') {
                popover.style.top = parentBounds.y - popoverBounds.height - (as + this.options.offset) + 'px'
                popover.style.left = parentBounds.x - (popoverBounds.width / 2) + (parentBounds.width / 2) + 'px'
                arrow.style.left = (popoverBounds.width / 2) - as + 'px'
            } else {
                popover.style.top = parentBounds.y + parentBounds.height + (as + this.options.offset) + 'px'
                popover.style.left = parentBounds.x - (popoverBounds.width / 2) + (parentBounds.width / 2) + 'px'
                arrow.style.left = (popoverBounds.width / 2) - as + 'px'
            }

            this._dispatchEvent('show.icon-list')
            this.transition(popover, 'opacity', this.options.delay, 0, 1, () => {
                this._dispatchEvent('shown.icon-list')
            })
        } else {
            this._dispatchEvent('hide.icon-list')
            this.transition(popover, 'opacity', this.options.delay, 1, 0, () => {
                this._dispatchEvent('hidden.icon-list')
            })
        }

        this.hidden = !this.hidden
    }

    /**
       * Transition a style property
       * @param {Element} element The element whose style to change
       * @param {string} property The property to change
       * @param {number} duration The amount of time that the transition should last for
       * @param {number} start The start value
       * @param {number} stop The end value
       * @param {function} callback The callback to make when the transition is done
       * @param {string} suffix The suffix, can be used for units like `px`, `em`, `%`
       * @param {number} steps The number of steps, increase for smoothness
       */
    transition(element, property, duration, start, stop, callback = null, suffix = '', steps = 10) {
        const startTime = Date.now()
        const endTime = startTime + duration
        this.transitionWorker(
            (x) => { // setter
                element.style[property] = x + suffix
            },
            () => { // getter for next value based on time
                const x = Date.now()
                return (x - startTime) * (stop - start) / (endTime - startTime) + start
            },
            (x) => { // determine if we need to continue
                return (start < stop && x < stop) || (start > stop && x > stop)
            },
            duration / steps,
            callback
        )
    }

    transitionWorker(setter, getter, continueChecker, timeout, callback) {
        const x = getter()
        setter(x)

        if (continueChecker(x)) {
            setTimeout(
                () => { this.transitionWorker(setter, getter, continueChecker, timeout, callback) },
                timeout
            )
        } else if (callback !== null) {
            callback()
        }
    }

    _dispatchEvent(name, bubbles = true) {
        this.main.dispatchEvent(new CustomEvent(name, { bubbles: bubbles }))
    }
}

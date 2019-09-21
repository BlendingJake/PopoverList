# PopoverList

A JavaScript module for creating popover lists. The only dependency is  
Font Awesome. Bootstrap and even jQuery are not used!

## Usage

```javascript
import PopoverList from "./js/popover_list.js";
let popover = new PopoverList(id, options);
popover.draw(parent_element);
```

```javascript
options = {
    icon: Font awesome icon class name,
    text: [optional] Text to display by the icon,
    icon_size: [optional] The size of the icon, defaults to 1,
    color_class: [optional] A class to apply to the icon to use for its color,
    offset: [optional] The number of pixels between the popover and the icon/text,
    placement: [optional] Where to place the popover, defaults to right, options are left, right, top, or bottom,
    trigger: [optional] What event causes the popover to close, defaults to click, allows focus,
    delay: [optional] The amount of time it takes for the popover to fade in, in milliseconds, defaults to 300

    children: [
        {

        }
    ]
}
```

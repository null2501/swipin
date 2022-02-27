# Swipin Slider

Sub-10KB Multi-Purpose Vanilla Slider 

## Contents
+ [Features](#features)
+ [Install](#install)
+ [Basic Usage](#basic-usage)
+ [Configuration](#configuration)
+ [Methods](#methods)
+ [Custom Events](#custom-events)
+ [License](#license)

## Features
- Minified javascript under 8KB, minified CSS under 6KB: sub-10KB on the wire if compressed
- Responsive: the slider maintains a given aspect ratio. AR can be controlled via CSS/media query
- Autoplay: advancement is blocked if the slider is not visibile and, optionally, on mouseover events
- Lazyload based on current slide and slider visibility
- Touch compatible
- Loop
- CSS controlled appearence: JS does class-switching only
- Simple or extended mode: extended mode shows parts of the contiguous slides
- Easy to configure via HTML data-xxx attributes
- JS integration with custom events and methods
- Automatically adds controls and pager if needed
- Dynamically add, remove and modify slider content via JS methods
- Core Web Vitals friendly: no layout changes on slider activation
- No render blocking JavaScript

## Install
Download and unzip: only `swipin.min.css` and `swipin.min.js` are needed.

## Basic Usage

#### 1. Add CSS
```html
<link rel="stylesheet" href="/PATH/TO/swipin.min.css">
```

#### 2. Add HTML
```html
<div class="swipin">
	<div class="swipin-slider">
		<div class="swipin-item">Slide 1</div>
		<div class="swipin-item">Slide 2</div>
		<div class="swipin-item">Slide 3</div>
	</div>
</div>
```

#### 3. Load Swipin JS
```html
<script src="/PATH/TO/swipin.min.js" async></script>
```

#### 4. Customize appearence and behaviour
Optional: use Swipin demos as a starting point or create your slider from scratch using CSS, options and JS

## Configuration

You can configure slider option by adding data- attributes and CSS classes to the \<div class="swipin"\> element:

#### Tag Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `data-loop` | "true" \| "false" | Default: "true". Enable or disable slider looping. |
| `data-autoplay` | "false" \| positive integer | Default: "false". Any positive number will enable autoplay and set the number of milliseconds between slide changes. |
| `data-mousepause` | "true" \| "false" | Default: "true". Enable or disable autoplay pause on mouseover. |
| `data-controls` | "true" \| "false" | Default: "true". Enable or disable slider controls next/prev. |
| `data-pager` | "true" \| "false" | Default: "true". Enable or disable slider pager. |

Example: `<div class="swipin" data-autoplay="5000" data-pager="false">` to setup autoplay and disable pager.

#### Classes

| Class | Description |
| --- | --- |
| `swipin-gaps` | Create gaps between slides. Optionally, you can customize the offsets via `.swipin-gaps .swipin-next` and `.swipin-gaps .swipin-prev` classes.|
| `swipin-16_9` | Set 16:9 aspect (default). |
| `swipin-9_16` | Set 9:16 aspect. |
| `swipin-1_1` | Set 1:1 (square) aspect. |
| `swipin-5_4` | Set 5:4 aspect. |
| `swipin-4_3` | Set 4:3 aspect. |
| `swipin-3_2` | Set 3:2 aspect. |
| `swipin-3_1` | Set 3:1 aspect. |

Example: `<div class="swipin swipin-1_1">` for a square slider.

#### Custom Aspect Ratios

If you need a specific aspect ratio, you can configure it via CSS by overriding `.swipin-slider` top padding, even with media queries.

Example: `.swipin-slider { padding-top: 62.5%; }` for a 16:10 aspect ratio.


#### Basic Slider Markup

```html
<div class="swipin">
	<div class="swipin-slider">
		<div class="swipin-item">Slide 1</div>
		<div class="swipin-item">Slide 2</div>
		<div class="swipin-item">Slide 3</div>
	</div>
</div>
```

#### Extended Slider Markup

Extended slider shows part of the previous and the next slide.

```html
<div class="swipin">
	<div class="swipin-extender">
		<div class="swipin-slider">
			<div class="swipin-item">Slide 1</div>
			<div class="swipin-item">Slide 2</div>
			<div class="swipin-item">Slide 3</div>
		</div>
	</div>
</div>
```


## Methods

Once the slider is active, the slider object can be accessed via JavaScript using - for example - the id of the slider:

HTML
```html
<div class="swipin" id="myslider">
	...
</div>
```


#### update
Re-initialize the slider.
```javascript
document.getElementById('myslider').swipin.update();
```

#### info
Get slider info including current position, slide number...
```javascript
console.log(document.getElementById('myslider').swipin.info());
```

#### goTo
Move the slider to a specified position.
```javascript
document.getElementById('myslider').swipin.goTo(3);
```

#### prev
Move to the previous slide.
```javascript
document.getElementById('myslider').swipin.prev();
```

#### next
Move to the next slide.
```javascript
document.getElementById('myslider').swipin.next();
```

#### getItem
Get the slide element at the specified position.
```javascript
console.log(document.getElementById('myslider').swipin.getItem(2));
```

#### setItem
Set the HTML content of the specified position.
```javascript
document.getElementById('myslider').swipin.setItem(2, "<h4>HI!</h4>");
```

#### addItem
Add a new slide at the specified position, using the specified HTML.
```javascript
document.getElementById('myslider').swipin.setItem(4, "<h4>NEW SLIDE!</h4>");
```

#### removeItem
Remove the slided at the specified position.
```javascript
document.getElementById('myslider').swipin.removeItem(3);
```

## Custom Events

Event listener can be placed on the "swipin" \<div\> using - for example - the element id.

HTML
```html
<div class="swipin" id="myslider">
	...
</div>
```

#### swipinInit
Triggered after swiper initialization/update.
```javascript
var obj = document.getElementById('myslider');
obj.addEventListener('swipinInit',function(){console.log('init', obj.swipin.info())});
```

#### swipinBeforeMove
Triggered before slider movement.
```javascript
var obj = document.getElementById('myslider');
obj.addEventListener('swipinBeforeMove',function(){console.log('beforeMove', obj.swipin.info())});
```

#### swipinMove
Triggered after slider movement.
```javascript
var obj = document.getElementById('myslider');
obj.addEventListener('swipinMove',function(){console.log('Move', obj.swipin.info())});
```

#### swipinVisibility
Triggered after visibility changes.
```javascript
var obj = document.getElementById('myslider');
obj.addEventListener('swipinVisibility',function(){console.log('Visibility', obj.swipin.info())});
```


## License
This project is available under the [MIT](https://opensource.org/licenses/mit-license.php) license.

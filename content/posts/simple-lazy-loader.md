---
title: 'Simple lazy loader'
date: '2019-07-15'
published: true
layout: post
tags: ['lazy load', 'javascript', 'performance', 'optimization']
category: 'work'
---


Simple lazy loader to lazy load images, videos, iframes and background images. This is without any dependencies. Doesn't work on browsers not supporting intersection observer API. However, you can polyfill it with `<script src="https://cdn.jsdelivr.net/npm/intersection-observer-polyfill@0.1.0/dist/IntersectionObserver.js"></script>` or `npm install intersection-observer`

```js
const lazyLoad = opts => {
  opts = opts || {};

  const target = opts.target || document.body;
  const lazyClass = "." + (opts.class || "lazy");
  const mutations = opts.mutations || false;
  const willLoad = opts.willLoad;
  const threshold = opts.threshold || "200px";
  const dataAttrs = ["srcset", "src", "poster"];

  const BOT_REGEX = /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex/i;

  const win = window;
  const IO = "IntersectionObserver";
  const IOentry = IO + "Entry";
  const supportsIO =
    IO in win && IOentry in win && "isIntersecting" in win[IOentry].prototype;

  const queryDOM = (selector, root) => {
    return root.querySelectorAll(selector);
  };

  let pending = new Set();
  let loaded = new Set();

  queryDOM(lazyClass, target).forEach(el => {
    pending.add(el);
  });

  // load instantly
  if (!supportsIO || BOT_REGEX.test(navigator.userAgent)) {
    pending.forEach(load);
    return;
  }

  const load = el => {
    willLoad && willLoad(el);

    if (el.dataset.bg) el.style.backgroundImage = "url(" + el.dataset.bg + ")";
    else {
      flipAttrs(el);

      let nodeName = el.nodeName;

      if (nodeName == "PICTURE" || nodeName == "VIDEO")
        queryDOM("source, img", el).forEach(flipAttrs);

      el.autoplay &&
        win.requestAnimationFrame(() => {
          el.load();
        });
    }

    pending.delete(el);
    loaded.add(el);
  };

  const flipAttrs = el => {
    dataAttrs.forEach(dataAttr => {
      if (dataAttr in el.dataset) el[dataAttr] = el.dataset[dataAttr];
    });
  };

  let iO = new win[IO](
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          load(el);
          unwatch(el);

          if (!pending.size && !mutations) iO.disconnect();
        }
      });
    },
    { rootMargin: threshold }
  );

  pending.forEach(watch);

  const watch = el => {
    iO.observe(el);
  };

  const unwatch = el => {
    iO.unobserve(el);
  };

  const isInTarg = node => {
    return node == target || target.contains(node);
  };

  if (mutations) {
    let mO = new MutationObserver(() => {
      queryDOM(lazyClass, target).forEach(el => {
        if (!loaded.has(el) && !pending.has(el)) {
          pending.add(el);
          watch(el);
        }
      });

      // detect detached nodes
      loaded.forEach(el => {
        if (!isInTarg(el)) {
          loaded.remove(el);
          unwatch(el);
        }
      });
    });

    mO.observe(target, {
      childList: true,
      subtree: true
      //	characterData: false,		// needed?
    });
  }
};

module.exports = lazyLoad;
```

```html
<body>
  <img class="lazy" src="placeholder.jpg" data-src="1x.jpg" data-srcset="2x.jpg 2x, 1x.jpg 1x">

  <picture class="lazy">
    <source data-srcset="2x.webp 2x, 1x.webp 1x" type="image/webp">
    <img src="placeholder.jpg" data-src="1x.jpg" data-srcset="2x.jpg 2x, 1x.jpg 1x">
  </picture>

  <video class="lazy" data-poster="placeholder.jpg" controls preload="none">
    <source src="video.webm" type="video/webm">
    <source src="video.mp4" type="video/mp4">
  </video>

  <iframe class="lazy" data-src="iframe.html"></iframe>

  <div class="lazy" data-bg="background.jpg"></div>
</body>
```

```js
document.addEventListener("DOMContentLoaded", () => {
  lazyLoad({
      target: document.body,
      mutations: true,
      class: "lazy",
      threshold: "200px",
      willLoad: el => {
          console.log(el);
      }
  });
});
```

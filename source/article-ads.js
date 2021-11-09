/**
 * Browser processor
 */

const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser()) {
  console.clear();
}
/**
 * @type {import("../lib/config")}
 */
const hexoAdsenseConfig = JSON.parse(document.getElementById("hexo-adsense-config").textContent);
console.log(hexoAdsenseConfig);

/**
 * Insert after element
 * @param {HTMLElement} newElement
 * @param {HTMLElement} oldElement
 */
function insertAfter(newElement, oldElement) {
  if (oldElement && newElement) {
    let parent = oldElement.parentNode;
    if (parent.lastChild == oldElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, oldElement.nextSibling);
    }
  } else {
    console.error("cannot insert element");
  }
}

/**
 * Replace elements with new
 * @param {HTMLElement} newElement
 * @param {HTMLElement} oldElement
 */
function replaceWith(newElement, oldElement) {
  /*
  if (!oldElement.parentNode) {
    console.log(oldElement, "parent null");
    let d = document.createElement("div");
    d.appendChild(oldElement);
  } else {
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }
  */
  try {
    oldElement.parentNode.replaceChild(newElement, oldElement);
  } catch (e) {}
}

let createElementFromHTML = function (htmlString) {
  if (htmlString instanceof HTMLElement) {
    return htmlString;
  }
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
};

function oldMethod() {
  let article = document.getElementsByTagName("article");
  let adscont = document.getElementById("hexo-adsense-ads-content");
  if (adscont && adscont.length) {
    if (article && article.length) {
      let linebreak = article.item(0).getElementsByTagName("br");
      if (linebreak.length > 0) {
        return replaceWith(adscont, linebreak.item(0));
      }

      let headings = article.item(0).querySelectorAll("h2,h3,h4,h5");
      if (headings && headings.length > 0) {
        return insertAfter(adscont, headings.item(0));
      }
    }
  }
}

/**
 * random number between min and max
 */
function ranumb(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const adshide = document.getElementById("hexo-adsense-hidden");
const adscont = adshide.querySelectorAll('[hexo-adsense="ads-content"]');
const article = document.querySelectorAll("article");
if (article.length > 0 && adscont.length > 0) {
  if (article.length == 1) {
    console.log("webpage is post");
    /**
     * @type {HTMLElement}
     */
    let ads;
    let targetArticle = article.item(0);

    /**
     * auto ads on br
     */
    // eslint-disable-next-line no-unused-vars
    const auto_br = function () {
      let linebreak = targetArticle.querySelectorAll("br");
      if (linebreak.length > 0) {
        if (linebreak.length == 1) {
          ads = adscont[0];
          replaceWith(createElementFromHTML(ads), linebreak.item(0));
        } else {
          for (let index = 0; index < adscont.length; index++) {
            ads = adscont[index];
            replaceWith(createElementFromHTML(ads), linebreak.item(ranumb(0, linebreak.length)));
          }
        }
        adshide.remove();
      }
    };

    const ads_fill = targetArticle.querySelectorAll("*[hexo-adsense-fill]");
    if (ads_fill.length > 0) {
      for (let index = 0; index < ads_fill.length; index++) {
        const toFill = ads_fill[index];
        if (typeof adscont[index] !== "undefined") {
          toFill.appendChild(adscont[index]);
        }
      }
    }
    adshide.remove();
  } else {
    console.log("webpage is not post");
  }
}

function eventMethod() {
  document.addEventListener("DOMContentLoaded", function () {
    // we look for the jump break
    var _moreElm = document.querySelector("a[name=more]");

    // here is your adsense code
    var _adsenseCode = " [replace this with code from the last step] ";

    // This inserts the ad inside of the blog post
    _moreElm.insertAdjacentHTML("afterend", '<div class="adsense-after-break">' + _adsenseCode + "</div>");

    // Initialize the ads here
    (adsbygoogle = window.adsbygoogle || []).push({});
  });
}

if (!isBrowser()) {
  module.exports = {
    replaceWith,
    insertAfter,
  };
}

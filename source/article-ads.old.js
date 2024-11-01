/**
 * Browser processor
 */

const isBrowser = new Function('try {return this===window;}catch(e){ return false;}');

/**
 * @type {import("../src/config")}
 */
const hexoAdsenseConfig = JSON.parse(document.getElementById('hexo-adsense-config').textContent);
//console.log(hexoAdsenseConfig);

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
    console.error('cannot insert element');
  }
}

/**
 * Replace elements with new
 * @param {HTMLElement} newElement
 * @param {HTMLElement} oldElement
 */
function replaceWith(newElement, oldElement) {
  if (!oldElement.parentNode) {
    console.log(oldElement, 'parent null');
    let d = document.createElement('div');
    d.appendChild(oldElement);
  } else {
    //console.log(oldElement.parentNode.tagName);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  }
  /*
   try {
     oldElement.parentNode.replaceChild(newElement, oldElement);
   } catch (e) {}
   */
}

let createElementFromHTML = function (htmlString) {
  if (htmlString instanceof HTMLElement) {
    return htmlString;
  }
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
};

function oldMethod() {
  let article = document.getElementsByTagName('article');
  let adscont = document.getElementById('hexo-adsense-ads-content');
  if (adscont && adscont.length) {
    if (article && article.length) {
      let linebreak = article.item(0).getElementsByTagName('br');
      if (linebreak.length > 0) {
        return replaceWith(adscont, linebreak.item(0));
      }

      let headings = article.item(0).querySelectorAll('h2,h3,h4,h5');
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

function newMethod() {
  const adshide = document.getElementById('hexo-adsense-hidden');
  let adscont = adshide.querySelectorAll('[hexo-adsense="ads-content"]');
  const article = document.querySelectorAll('article');
  if (article.length > 0 && adscont.length > 0) {
    /**
     * @type {HTMLElement}
     */
    let ads;
    if (article.length == 1) {
      console.log('webpage is post');
      let targetArticle = article.item(0);

      // prioritize hexo-adsense-fill before auto ads on other elements
      const ads_fill = targetArticle.querySelectorAll('*[hexo-adsense-fill]');
      if (ads_fill.length > 0) {
        for (let index = 0; index < ads_fill.length; index++) {
          const toFill = ads_fill[index];
          if (typeof adscont[index] !== 'undefined') {
            toFill.appendChild(adscont[index]);
          }
        }
      }

      // the rest of the ads will show automatically after headers, pre elements
      adscont = adshide.querySelectorAll('[hexo-adsense="ads-content"]');
      //console.log(adscont.length, "ads left");
      if (adscont.length > 0) {
        const headers = targetArticle.querySelectorAll('h1,h2,h3,h4,h5,h6,pre');
        if (headers.length > 0) {
          // generate index of headers
          let headers_index = Array.apply(null, { length: headers.length }).map(Number.call, Number);
          //console.log(headers_index);
          for (let index = 0; index < adscont.length; index++) {
            ads = adscont[index];
            const rheaders = shuffleArr2(headers_index);
            // pick a random index
            const rheader = rheaders.next().value;
            if (typeof rheader === 'number') {
              const header = headers.item(rheader);
              insertAfter(createElementFromHTML(ads), header);
            }
          }
        }
      }

      // the rest of the ads will show automatically to linebreak elements
      adscont = adshide.querySelectorAll('[hexo-adsense="ads-content"]');
      if (adscont.length > 0) {
        const linebreaks = targetArticle.querySelectorAll('br,hr');
        if (linebreaks.length > 0) {
          // generate index of linebreaks
          let linebreaks_index = Array.apply(null, { length: linebreaks.length }).map(Number.call, Number);
          //console.log(linebreaks_index);
          // randomize linebreaks index
          const rlinebreaks = shuffleArr2(linebreaks_index);
          for (let index = 0; index < adscont.length; index++) {
            ads = adscont[index];
            // pick a random index
            const rlinebreak = rlinebreaks.next().value;
            if (typeof rlinebreak == 'number') {
              const linebreak = linebreaks.item(rlinebreak);
              if (
                ['blockquote', 'img', 'a', 'pre', 'code', 'em', 'strong', 'i', 'u'].includes(
                  linebreak.parentNode.tagName.toLowerCase()
                )
              ) {
                index--;
                continue;
              }
              //console.log(linebreak.tagName);
              replaceWith(createElementFromHTML(ads), linebreak);
            }
          }
        }
      }
    } else {
      console.log('webpage is not post');
      // generate index of articles
      let articles_index = Array.apply(null, { length: article.length }).map(Number.call, Number);
      // randomize linebreaks index
      const rArticles = shuffleArr2(articles_index);
      for (let index = 0; index < adscont.length; index++) {
        ads = adscont[index];
        // pick a random index
        const rArticle = rArticles.next().value;
        if (typeof rArticle == 'number') {
          //console.log("adsense display to article index", rArticle);
          const pickArticle = article.item(rArticle);
          pickArticle.appendChild(createElementFromHTML(ads));
        }
      }
    }

    // summon adsbygoogle.push()
    adsensePush();
  }
}

function eventMethod() {
  document.addEventListener('DOMContentLoaded', function () {
    // we look for the jump break
    var _moreElm = document.querySelector('a[name=more]');

    // here is your adsense code
    var _adsenseCode = ' [replace this with code from the last step] ';

    // This inserts the ad inside of the blog post
    _moreElm.insertAdjacentHTML('afterend', '<div class="adsense-after-break">' + _adsenseCode + '</div>');

    // Initialize the ads here
    (adsbygoogle = window.adsbygoogle || []).push({});
  });
}

/**
 * Shuffle Array
 * @param {any[]} array
 * @see {@link https://stackoverflow.com/a/18806417}
 * @returns
 */
function shuffleArr(array) {
  var i = array.length,
    j = 0,
    temp;

  while (i--) {
    j = Math.floor(Math.random() * (i + 1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

/**
 * Next generation of non-repeated randomizer
 * @see {@link shuffleArr}
 * @param {any[]} array
 */
function* shuffleArr2(array) {
  var i = array.length;

  while (i--) {
    yield array.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
  }
}

function adsensePush() {
  for (let index = 0; index < document.querySelectorAll('[hexo-adsense="ads-content"]').length; index++) {
    (adsbygoogle = window.adsbygoogle || []).push({
      google_ad_client: hexoAdsenseConfig.pub
    });
  }
}

if (!isBrowser()) {
  module.exports = {
    replaceWith,
    insertAfter
  };
} else {
  window.__tcfapi = (command, parameter, callback) => {
    if (command === 'checkConsent') {
      callback(true);
    }
    if (command === 'addEventListener') {
      callback({ eventStatus: 'tcloaded', gdprApplies: false }, true);
    }
  };

  if (typeof document.addEventListener == 'function') {
    document.addEventListener('DOMContentLoaded', newMethod);
  } else if (typeof window.attachEvent == 'function') {
    window.attachEvent('onload', newMethod);
  } else {
    window.onload = newMethod;
  }
}

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

function newMethod() {
  console.log('new method initialize');
  const adshide = document.getElementById('hexo-adsense-hidden');
  let adscont = Array.from(adshide.querySelectorAll('[hexo-adsense="ads-content"]'));
  let article = Array.from(document.querySelectorAll('article'));
  if (!article.length) {
    const post = document.querySelector('#post');
    if (post) article = [post];
  }

  if (article.length > 0 && adscont.length > 0) {
    /**
     * @type {HTMLElement}
     */
    let ads;
    if (article.length == 1) {
      console.log('webpage is post');
      let targetArticle = article[0];

      // prioritize hexo-adsense-fill before auto ads on other elements
      const ads_fill = targetArticle.querySelectorAll('*[hexo-adsense-fill]');
      if (ads_fill.length > 0) {
        console.log('found hexo-adsense-fill', ads_fill.length);
        for (let index = 0; index < ads_fill.length; index++) {
          const toFill = ads_fill[index];
          if (typeof adscont[index] !== 'undefined') {
            toFill.appendChild(adscont[index]);
          }
        }
      }

      // the rest of the ads will show automatically after headers elements
      adscont = Array.from(adshide.querySelectorAll('[hexo-adsense="ads-content"]'));

      if (adscont.length > 0) {
        console.log('Iterating headers', adscont.length, 'ads left');
        const headers = targetArticle.querySelectorAll('h1,h2,h3,h4,h5,h6');
        if (headers.length > 0) {
          // generate index of headers
          let headers_index = Array.apply(null, { length: headers.length }).map(Number.call, Number);
          //console.log(headers_index);
          for (let index = 0; index < adscont.length; index++) {
            // ads = adscont[index];
            ads = adscont.shift();
            const rheaders = array_shuffle(headers_index);
            // pick a random index
            const rheader = rheaders.next().value;
            if (typeof rheader === 'number') {
              const header = headers.item(rheader);
              insertAfter(createElementFromHTML(ads), header);
            }
          }
        }
      }

      if (adscont.length > 0) {
        console.log('Iterating pre code', adscont.length, 'ads left');

        // Select all <pre> elements that are not inside a <td>
        const preElements = document.querySelectorAll('pre:not(td > pre)');

        if (preElements.length > 0) {
          // generate index of headers
          let preElements_index = Array.apply(null, { length: preElements.length }).map(Number.call, Number);
          //console.log(headers_index);
          for (let index = 0; index < adscont.length; index++) {
            // ads = adscont[index];
            ads = adscont.shift();
            const rPreElements = array_shuffle(preElements_index);
            // pick a random index
            const rPre = rPreElements.next().value;
            if (typeof rPre === 'number') {
              const header = preElements.item(rPre);
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
          const rlinebreaks = array_shuffle(linebreaks_index);
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
      if (!article.length) {
        article = document.querySelectorAll('[class*="recent-post-item"]');
      }
      // generate index of articles
      let articles_index = Array.apply(null, { length: article.length }).map(Number.call, Number);
      // randomize linebreaks index
      const rArticles = array_shuffle(articles_index);
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

/**
 * Next generation of non-repeated randomizer
 * @see {@link shuffleArr}
 * @param {any[]} array
 */
function* array_shuffle(array) {
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

/**
 * Browser processor
 */

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
  if (oldElement) oldElement.parentNode.replaceChild(newElement, oldElement);
}

var isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

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

let adscont = document.querySelectorAll('[hexo-adsense="ads-content"]');
let article = document.querySelectorAll("article");
if (article.length > 0 && adscont.length > 0) {
  if (article.length == 1) {
    console.log("webpage is post");
    let targetArticle = article.item(0);
    // find br
    let linebreak = targetArticle.getElementsByTagName("br");
    if (linebreak.length > 0) {
      return replaceWith(adscont, linebreak.item(0));
    }
  } else {
    console.log("webpage is not post");
  }
}

if (!isBrowser()) {
  module.exports = {
    replaceWith,
    insertAfter,
  };
}

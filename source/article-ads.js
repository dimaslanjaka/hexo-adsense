/**
 * Insert after element
 * @param {HTMLElement} newElement
 * @param {HTMLElement} oldElement
 */
function insertAfter(newElement, oldElement) {
  let parent = oldElement.parentNode;
  if (parent.lastChild == oldElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement, oldElement.nextSibling);
  }
}

/**
 * Replace elements with new
 * @param {HTMLElement} newElement
 * @param {HTMLElement} oldElement
 */
function replaceWith(newElement, oldElement) {
  oldElement.parentNode.replaceChild(newElement, oldElement);
}

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

let article = document.getElementsByTagName("article");
if (article.length > 0) {
  if (article.length == 1) {
    let targetArticle = article.item(0);
    // find br
    let linebreak = targetArticle.getElementsByTagName("br");
    if (linebreak.length > 0) {
      return replaceWith(adscont, linebreak.item(0));
    }
  }
}

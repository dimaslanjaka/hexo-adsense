if (window.location.host == "web-manajemen.blogspot.com") {
  let href = window.location.href;
  let url = new URL(href);
  //console.log(url);
  //console.log(url.toString());
  url.host = "www.webmanajemen.com";
  url.hostname = "www.webmanajemen.com";
  let newhref = url.protocol + "//" + url.host + url.pathname + url.search + url.hash;
  window.location.href = newhref;
}

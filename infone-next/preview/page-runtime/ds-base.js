(() => {
  const asset = (packagePath, standalonePath) =>
    /^\/api\/design-systems\/[^/]+\/static$/.test(location.pathname)
      ? location.pathname + '?path=' + encodeURIComponent(packagePath)
      : standalonePath;
  for (const href of [
    asset("fonts/fonts.css", "../../../fonts/fonts.css"),
    asset("tokens.css", "../../../tokens.css"),
  ]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
  const script = document.createElement("script");
  script.src = asset("preview/runtime/ds-bundle.js", "../../runtime/ds-bundle.js");
  document.head.appendChild(script);
})();

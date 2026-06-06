function parseCookies(request) {
  const list = {};
  const cookieHeader = request.get("Cookie");
  if (!cookieHeader) return list;

  cookieHeader.split(";").forEach((c) => {
    let [name, ...value] = c.split("=");

    name = name.trim();
    if (!name) return;

    const data = value.join("=").trim();
    if (!value) return;

    list[name] = decodeURIComponent(data);
  });

  return list;
}

module.exports = parseCookies;

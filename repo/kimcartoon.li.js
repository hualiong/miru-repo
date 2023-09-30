// ==MiruExtension==
// @name         KimCartoon
// @version      v0.0.1
// @author       OshekharO
// @lang         en
// @license      MIT
// @package      kimcartoon.li
// @type         bangumi
// @icon         https://kimcartoon.li/Content/images/favicon.ico
// @webSite      https://kimcartoon.li
// ==/MiruExtension==

export default class extends Extension {
  async latest() {
    const res = await this.request("/");
    const bsxList = await this.querySelectorAll(res, "div.item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "a", "href");
      const title = await this.querySelector(html, "div.info > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://kimcartoon.li" + cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const requestBody = {
      keyword: kw,
    };

    const res = await this.request("", {
      headers: {
        "Miru-Url": "https://kimcartoon.li/Search/Cartoon",
        "Cookie": "_ga=GA1.1.62524391.1696056214; _im_vid=01HBJHEEHYE8YRW650Z1WWV0KQ; _ga_6915SR2PDG=GS1.1.1696060614.2.1.1696061638.0.0.0; prefetchAd_5021906=true",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "User-Agent": "Mozilla/5.0 (Linux; Android 12; RMX2170) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36",
      },
      data: requestBody,
      method: "post",
    });

    const bsxList = await this.querySelectorAll(res, "div.section.group.list");
    const novel = [];

    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "div.col.info > p > a", "href");
      const title = await this.querySelector(html, "div.col.info > p > a").text;
      const cover = await this.querySelector(html, "img").getAttributeText("src");
      novel.push({
        title: title.trim(),
        url,
        cover: "https://kimcartoon.li" + cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request(`${url}`, {
      headers: {
        "miru-referer": "https://kimcartoon.li/",
      },
    });

    const title = await this.querySelector(res, "div.heading > h3").text;
    const cover = await this.querySelector(res, "div.col.cover > img").getAttributeText("src");
    const desc = await this.querySelector(res, "div.summary1 > p").text;

    const episodes = [];
    const epiList = await this.querySelectorAll(res, "ul.list > li");

    for (const element of epiList) {
      const html = await element.content;
      const name = await this.querySelector(html, "a").text;
      const url = await this.getAttributeText(html, "a", "href");

      episodes.push({
        name,
        url: "https://kimcartoon.li" + url + "&s=sw",
      });
    }

    return {
      title,
      cover,
      desc,
      episodes: [
        {
          title: "Chapters",
          urls: episodes.reverse(),
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const dwishLink = res.match(/https:\/\/kswplayer\.info\/e\/[^\s'"]+/);

    const dwishLinkRes = await this.request("", {
      headers: {
        "Miru-Url": dwishLink,
      },
    });

    const directUrlMatch = dwishLinkRes.match(/(https:\/\/[^\s'"]*\.m3u8[^\s'"]*)/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";

    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}

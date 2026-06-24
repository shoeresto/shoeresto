const fs = require("fs");

require("dotenv").config();
const ACCESS_TOKEN = process.env.IG_TOKEN;
const IG_ID = process.env.IG_ID;

async function build() {

  const url =
    `https://graph.facebook.com/v25.0/${IG_ID}/media` +
    `?fields=id,caption,media_type,media_url,permalink,timestamp` +
    `&limit=500` +
    `&access_token=${ACCESS_TOKEN}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.error) {
    console.error(json.error);
    return;
  }

  const posts = json.data
    .filter(post => post.media_type !== "VIDEO")
    .map(post => {

      const caption = (post.caption || "").toLowerCase();

      const tags = [];

      // ===== 브랜드 / 모델 =====

      if (
        caption.includes("#kobe") ||
        caption.includes("#sr_kobe")
      ) {
        tags.push("kobe");
      }

      if (
        caption.includes("#jordan") ||
        caption.includes("#sr_jordan")
      ) {
        tags.push("jordan");
      }

      if (
        caption.includes("#airmax") ||
        caption.includes("#airforce1") ||
        caption.includes("#nike")
      ) {
        tags.push("nike");
      }

      if (
        caption.includes("#newbalance") ||
        caption.includes("#sr_nb")
      ) {
        tags.push("newbalance");
      }

      if (
        caption.includes("#adidas") ||
        caption.includes("#sr_adidas")
      ) {
        tags.push("adidas");
      }

      if (
        caption.includes("luxury") ||
        caption.includes("gucci") ||
        caption.includes("maisonmargiela") ||
        caption.includes("hermes") ||
        caption.includes("dior") ||
        caption.includes("louisvuitton") ||
        caption.includes("#sr_lux")
      ) {
        tags.push("luxury");
      }

      // 기타
      if (
        tags.length === 0 ||
        caption.includes("#sr_etc")
      ) {
        tags.push("other");
      }



      return {
        id: post.id,
        image: post.media_url,
        link: post.permalink,
        caption: post.caption || "",
        media_type: post.media_type,
        timestamp: post.timestamp,
        tags: [...new Set(tags)]
      };

    });

  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }

  fs.writeFileSync(
    "./data/posts.json",
    JSON.stringify(posts, null, 2)
  );

  console.log(`${posts.length} posts saved.`);
}

build();
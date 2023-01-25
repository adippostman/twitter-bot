import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
puppeteer.use(StealthPlugin());
import * as dotenv from "dotenv";
dotenv.config();
import readlineSync from "readline-sync";

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

(async () => {
  const username = process.env.TWITTER_USERNAME;
  const password = process.env.TWITTER_PASSWORD;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: executablePath(),
  });
  const newPage = await browser.newPage();
  await newPage.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
  });

  // open twitter login page
  await newPage.goto(`https://twitter.com/i/flow/login`);

  // typing username and press enter
  console.log(`[-] Mengetik username: ${username}`);
  const usernameSelector = `input[autocomplete="username"]`;
  await newPage.waitForSelector(usernameSelector);
  await newPage.click(usernameSelector);
  await newPage.type(usernameSelector, username, { delay: 100 });
  await newPage.keyboard.press(`Enter`);
  await delay(3000);

  //typing password and press enter
  console.log(`[?] Mengetik password: ****`);
  const passwordSelector = `input[name="password"]`;
  await newPage.waitForSelector(passwordSelector);
  await newPage.type(passwordSelector, password, { delay: 100 });
  await newPage.keyboard.press(`Enter`);
  console.log(`[?] Menunggu 10 detik validasi`);
  await delay(10000);
  // await newPage.screenshot({ path: `yoo.png` });
  const title = await newPage.title();

  if (title == `Home / Twitter`) {
    console.log(`[=] Login berhasil username: ${username}`);
    await newPage.goto(`https://twitter.com/${username}`);
    await newPage.waitForSelector(
      `div[dir="ltr"] > span > span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0`
    );

    const span = await newPage.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          `div[dir="ltr"] > span > span.css-901oao.css-16my406.r-poiln3.r-bcqeeo.r-qvutc0`
        ),
        (e) => e.innerHTML
      );
    });

    console.log(`\n[=] Hello, ${span[1].trim()}`);
    await delay(2000);
    const loops = parseInt(readlineSync.question(`Looping berapa? `));
    console.log(`\n[#] Melakukan looping ${loops} kali`);
    await delay(2000);
    for (let a = 1; a <= loops; a++) {
      console.log(`\n[${a}] Looping ke ${a}`);
      console.log(`[${a}][~] Mencoba mengambil tweet terbaru tentang Bitcoin`);
      await newPage.goto(
        `https://twitter.com/search?q=bitcoin&src=recent_search_click&f=live`
      );

      await newPage.waitForSelector(
        "div.css-1dbjc4n.r-18u37iz.r-1wbh5a2.r-13hce6t > div > div.css-1dbjc4n.r-18u37iz.r-1q142lx > a"
      );
      console.log(`[${a}][=] Menunggu 5 detik`);
      await delay(5000);
      const links = await newPage.evaluate(() => {
        return Array.from(
          document.querySelectorAll(
            "div.css-1dbjc4n.r-18u37iz.r-1wbh5a2.r-13hce6t > div > div.css-1dbjc4n.r-18u37iz.r-1q142lx"
          ),
          (a) => a.innerHTML
        ).map((x) => {
          return "https://twitter.com" + x.split('"')[1];
        });
      });

      if (links.length > 0) {
        console.log(
          `[${a}][=] Berhasil mendapatkan ${links.length} link untuk di-retweet.\n`
        );

        for (let index = 0; index < links.length; index++) {
          let linkId = links[index].split(`/`).pop();
          console.log(`[${a}][${index + 1}] Retweet: ${linkId}`);
          await newPage.goto(
            `https://twitter.com/intent/retweet?tweet_id=${linkId}`
          );
          await newPage.waitForSelector(
            'div[data-testid="confirmationSheetConfirm"]'
          );
          await newPage.keyboard.press(`Enter`);
          await delay(2000);
          console.log(`[${a}][${index + 1}] Done!`);
          // await newPage.screenshot({ path: `${index + 1}.png` });
          if (index !== links.length - 1) {
            console.log(`[${a}][${index + 1}] Menunggu 10 detik\n`);
            await delay(10000);
          } else {
            console.log(`\n[${a}] Berhasil me-Retweet semua!`);
            console.log(`[${a}] Berhasil melakukan retweet loop ke ${a}`);
            if (loops == a) {
              console.log(`\n[#] Bot Exit`);
            } else {
              console.log(`\n[#] Biar ga baned akunmu`);
              console.log(`[#] Kasih delay 10 menit`);
              await delay(600000);
            }
          }
        }
      }
    }
  } else {
    console.log(`[!] Gagal login!`);
    console.log(`[!] Cek kembali data di file .env`);
  }
  await browser.close();
})();

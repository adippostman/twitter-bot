import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
puppeteer.use(StealthPlugin());
import * as dotenv from "dotenv";
dotenv.config();
import readlineSync from "readline-sync";
import moment from "moment";

const delay = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

const showMessage = (message) => {
    console.log(`[${moment().format("LTS")}] ${message}`);
};

(async () => {
    const username = readlineSync
        .question(`input twitter username: `)
        .trim()
        .toLowerCase();
    const password = readlineSync
        .question(`input twitter password: `)
        .trim()
        .toLowerCase();

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: executablePath(),
    });
    const newPage = await browser.newPage();
    await newPage.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
    });
    newPage.setDefaultTimeout(60000);

    /* open twitter login page */
    await newPage.goto(`https://twitter.com/i/flow/login`);

    /* typing username and press enter */
    console.log(`[-] typing username: ${username}`);
    const usernameSelector = `input[autocomplete="username"]`;
    await newPage.waitForSelector(usernameSelector);
    await newPage.click(usernameSelector);
    await newPage.type(usernameSelector, username, { delay: 100 });
    await newPage.keyboard.press(`Enter`);
    await delay(3000);

    /* typing password and press enter */
    console.log(`[-] typing password: ${password}`);
    const passwordSelector = `input[name="password"]`;
    await newPage.waitForSelector(passwordSelector);
    await newPage.type(passwordSelector, password, { delay: 100 });
    await newPage.keyboard.press(`Enter`);
    console.log(`[?] validating in 10 seconds ..`);
    await delay(10000);
    const title = await newPage.title();

    /* if successfully login then */
    if (title == `Home / Twitter`) {
        console.log(`[=] success login`);

        /** target by username */
        const targets = [
            `ZhenChao18`,
            `elonmusk`,
            `cz_binance`,
            `binance`,
            `Aptos_Network`,
            `VitalikButerin`,
            `solana`,
            `Cristiano`,
            `Galxe`,
            `YouTube`,
            `dogecoin`,
            `amazon`,
            `netflix`,
            `saylor`,
            `MrBeast`,
            `coinbase`,
            `jack`,
            `Twitter`,
            `BillGates`,
            `Tesla`,
            `NASA`,
            `SpaceX`,
            `kucoincom`,
            `BNBCHAIN`,
            `0xPolygon`,
            `ethereum`,
        ];

        for (const [index, targetUsername] of targets.entries()) {
            console.log("");
            showMessage(
                `[${index + 1}/${
                    targets.length
                }] going to @${targetUsername} profile`
            );
            await newPage.goto(`https://twitter.com/${targetUsername}`, {
                waitUntil: "load",
            });
            await delay(5000);
            if (
                await newPage.$(
                    `div[aria-label="Following @${targetUsername}"]`
                )
            ) {
                showMessage(`already following @${targetUsername}`);
            } else {
                const buttons = await newPage.$$(
                    `div[aria-label="Follow @${targetUsername}"]`
                );
                if (buttons.length >= 1) {
                    await buttons[0].click();
                    showMessage(`youre now @${targetUsername} follower`);
                }
            }

            await delay(1000);
            await newPage.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            await delay(3000);
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

            if (links < 1) {
                showMessage(`cant get latest tweet from ${targetUsername}`);
                continue;
            }

            let linkId = links[0].split(`/`).pop();
            // showMessage(`going to like ${linkId}`);
            // await newPage.goto(
            //     `https://twitter.com/intent/like?tweet_id=${linkId}`,
            //     { waitUntil: "load" }
            // );
            // await newPage.waitForSelector(
            //     `div[data-testid="confirmationSheetConfirm"]`
            // );
            // await delay(3000);
            // await newPage.keyboard.press("Enter");
            // showMessage(`liked ${linkId}`);
            // await delay(1000);

            showMessage(`going to retweet ${linkId}`);
            await newPage.goto(
                `https://twitter.com/intent/retweet?tweet_id=${linkId}`,
                { waitUntil: "load" }
            );
            await newPage.waitForSelector(
                `div[data-testid="confirmationSheetConfirm"]`
            );
            await delay(1500);
            await newPage.keyboard.press("Enter");
            showMessage(`retweet ${linkId}`);
            await delay(1000);

            await delay(3000);
        }

        for (const cookie of await newPage.cookies()) {
            await newPage.deleteCookie(cookie);
            /** done all jobs */
        }
    } else {
        console.log(`[!] login failed`);
    }
    await browser.close();
})();

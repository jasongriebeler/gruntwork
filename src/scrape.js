const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://scrapethissite.com/pages/forms/')
    // await page.type("input[name='user']", "USER");
    // await page.type("input[name='pass']", "PASSWORD");
    // await page.click("input[name='Login →']");


    const hrefs = await page.$$eval('ul.pagination > li > a', anchors => {
        return anchors.map(anchor => {
            return {
                text: anchor.innerText,
                link: anchor.href
            }
        })
    });
    hrefs.forEach(href => {
        console.log("HREF: " + href.link);
    });
    await browser.close()
})();
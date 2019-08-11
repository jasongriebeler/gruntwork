const firebase = require("firebase-admin");
const puppeteer = require('puppeteer');
var fs = require('fs');
//
// const serviceAccount = require("../gruntwork-workouts-firebase.json");
//
// const app = firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     databaseURL: "https://gruntwork-workouts.firebaseio.com"
// });
//
// const db = firebase.database();
// const workouts = db.ref("workouts");

//
// var workout = workouts.child("07-22-19");
// workout.set({
//     something: true
// })
// .then(() => app.delete());


// (async () => {
//     const browser = await puppeteer.launch({headless: false});
//     const page = await browser.newPage();
//     await page.goto('https://scrapethissite.com/pages/forms/')
//     // await page.type("input[name='user']", "USER");
//     // await page.type("input[name='pass']", "PASSWORD");
//     // await page.click("input[name='Login →']");
//
//
//     const hrefs = await page.$$eval('ul.pagination > li > a', anchors => { return anchors.map(anchor => anchor.innerText) });
//     await Promise.all(hrefs.map(async href => {
//         console.log("HREF: " + href);
//         // await page.goto(href);
//     }));
//     await browser.close()
// })();

(async () => {

    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();
    // await page.goto("https://www.gruntworkout.com/my-account/");
    //
    // await page.type("#username", "jason.griebeler@gmail.com");
    // await page.type("#password", "4oK2M^q!336I2");
    // await page.click("button[name='login']");
    // await page.goto("https://www.gruntworkout.com/category/workouts/");
    //
    //
    //
    // let modal = await page.$("div.mc-closeModal", );
    // console.log("MODAL: " + modal);
    // if(modal){
    //     await page.waitFor("div.mc-closeModal", { visible: true })
    //         .then(element => element.click());
    // }

    var contents = fs.readFileSync('./password.txt', 'utf8');
    console.log(contents);
    await page.goto("file:///Users/jgriebeler/Downloads/Grunt%20Work%20Workouts%20%E2%80%A2%20Grunt%20Work.htm");

    const links = await page.$$eval("h3.entry-title > a", anchors => {
        console.log('anchors');
        return anchors.map(a => {
            console.log(a);
            return {
                title: a.innerText,
                link: a.href
            };
        })
    });
    links.forEach(link => console.log(link.title));
    await browser.close();
})();

async function childExists(ref, child){
    return ref.child(child).once("value")
        .then(snapshot => snapshot.val() !== null);
}

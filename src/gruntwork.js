const firebase = require("firebase-admin");
const puppeteer = require('puppeteer');
var fs = require('fs');

const serviceAccount = require("../gruntwork-workouts-firebase.json");
const gruntPassword = fs.readFileSync('./password.txt', 'utf8');

const app = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://gruntwork-workouts.firebaseio.com"
});

const db = firebase.database();
const workouts = db.ref("workouts");

(async () => {

    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();
    await page.goto("https://www.gruntworkout.com/my-account/");

    await page.type("#username", "jason.griebeler@gmail.com");
    await page.type("#password", gruntPassword);
    await page.click("button[name='login']");
    await page.goto("https://www.gruntworkout.com/category/workouts/");



    let modal = await page.$("div.mc-closeModal", );
    console.log("MODAL: " + modal);
    if(modal){
        await page.waitFor("div.mc-closeModal", { visible: true })
            .then(element => element.click());
    }

    // await page.goto("file:///Users/jgriebeler/Downloads/Grunt%20Work%20Workouts%20%E2%80%A2%20Grunt%20Work.htm");

    let workoutLinks = await page.$$eval("h3.entry-title > a", anchors => {
        return anchors.map(a => {
            return {
                title: a.innerText,
                link: a.href
            };
        })
    });
    // let workoutLinks = [
    //     {
    //         title: 'W/O – 08.10.19',
    //         link: 'file:///Users/jgriebeler/Downloads/W_O%20-%2008.16.19%20%E2%80%A2%20Grunt%20Work.html'
    //     }
    // ];
    workoutLinks = workoutLinks.filter(workoutLink => !childExists(workouts, nodeName(workoutLink.title))); // remove anything that already exists in firebase

    for(let entry of workoutLinks) {
        console.log(entry);
        await page.goto(entry.link);
        entry.content = await page.$$eval("div.entry-content > p", paragraphs => {
            return paragraphs.map(p => {return {
                innerHtml: p.innerHTML,
                innerText: p.innerText
            }
            });
        });
        entry.metaTags = await page.$$eval("div.post_tags a", anchors => {
            return anchors.map(a => a.innerText);
        });
        workouts.child(nodeName(entry.title)).set(entry);
    }

    app.delete()
        .then(browser.close());
})();

async function childExists(ref, child){
    return await ref.child(child).once("value")
        .then(snapshot => snapshot.val() !== null);
}

function nodeName(input){
    return input
        .replace(/\./g, '-')
        .replace(/\//g, '')
        .replace(/\s/g, '');
}

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
    if(modal){
        await page.waitFor("div.mc-closeModal", { visible: true })
            .then(element => element.click());
    }

    // await page.goto("file:///Users/jgriebeler/Downloads/Grunt%20Work%20Workouts%20%E2%80%A2%20Grunt%20Work.htm");
    // await page.goto("file:///Users/jgriebeler/Downloads/Grunt%20Work%20Workouts%20%E2%80%A2%20Grunt%20Work%20-last.htm");

    let entries = [];
    let advance = true;
    do {
        entries = entries.concat(await findEntries());
        let nextPage = await page.$("ul.page-numbers li a.next");
        if(nextPage) {
            await nextPage.click();
            await page.waitForNavigation();
        }
        else
            advance = false;
    } while(advance);

    await logEntries(entries);

    app.delete()
        .then(browser.close());

    async function findEntries(){
        let workoutLinks = await page.$$eval("h3.entry-title > a", anchors => {
            return anchors.map(a => {
                return {
                    title: a.innerText,
                    node: a.innerText
                        .replace(/\./g, '-')
                        .replace(/\//g, '')
                        .replace(/\s/g, ''),
                    link: a.href
                };
            })
        });
        const entriesExist = await Promise.all(workoutLinks.map(l => childExists(workouts, l.node)));
        workoutLinks = workoutLinks.filter(l => !entriesExist.find(e => e.node = l.node).exists );

        // return [
        //     {
        //         title: 'W/O – 08.10.19',
        //         link: 'file:///Users/jgriebeler/Downloads/W_O%20-%2008.16.19%20%E2%80%A2%20Grunt%20Work.html',
        //         node: nodeName('W/O – 08.10.19')
        //     }
        // ];
        return workoutLinks;
    }

    async function logEntries(workoutLinks){
        const entriesExist = await Promise.all(workoutLinks.map(l => childExists(workouts, l.node)));
        workoutLinks = workoutLinks.filter(l => !entriesExist.find(e => e.node = l.node).exists );

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
            workouts.child(entry.node).set(entry);
        }
    }
})();

async function childExists(ref, child){
    let exists = await ref.child(child).once("value")
        .then(snapshot => snapshot.val() !== null);
    return { node: child, exists: exists };
}

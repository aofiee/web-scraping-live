const express = require('express');
const app = express();
const port = 3000;
app.get('/',
    (request, response) => {
        const puppeteer = require('puppeteer');
        let scrape = async () => {
            const browserPromise = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            // const browserPromise = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            const url = request.query.url || 'https://www.ballzaa.com/linkdooball.php';
            const browser = await browserPromise;
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            await page.setViewport({ width: 1280, height: 1920 });
            await page.goto(url, { waitUntil: 'networkidle2' }); //networkidle2 domcontentloaded

            const onlineBall = await page.evaluate(() => {
                console.log('online');
                const linkballNodeList = document.querySelectorAll('.open-close');
                const descs = document.querySelectorAll('.desc');
                let titleLinkArray = [];
                for (let i = 0; i < linkballNodeList.length; i++) {
                    console.log('ok1');
                    const links = descs[i].getElementsByClassName('link_right');
                    let linkData = [];
                    let j = 0;
                    for (let item of links) {
                        console.log('ok2');
                        linkData[j] = {
                            title: item.innerText,
                            link: item.getElementsByTagName('a')[0].getAttribute('href').replace('#https://www.ballzaa.com/linkdooball.php', ''),
                        }
                        j++;
                    }

                    titleLinkArray[i] = {
                        title: linkballNodeList[i].innerText.trim(),
                        link: linkData
                    };
                }
                return titleLinkArray;
            });

            await browser.close();
            console.log(onlineBall);
            return onlineBall;
        };
        scrape().then((value) => {
            const json = JSON.stringify(value);
            response.type('application/json')
                .send(json)
        });
    }
)

app.listen(port, function () {
    console.log('Starting node.js on port ' + port);
});
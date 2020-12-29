const chromium = require("chrome-aws-lambda");

module.exports.get = async event => {
    const outlet = event.pathParameters.outlet;
    const outletInfo = getOutletInfo(outlet);

    try {
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.goto(outletInfo.url);

        const el = await page.$(outletInfo.tag);
        const headline = await (await el.getProperty("textContent")).jsonValue();

        return {
            statusCode: 200,
            body: JSON.stringify(headline),
        };
    } catch (error) {
        console.log("🚀 ~ file: headline.js ~ line 21 ~ error", error);
        return {
            statusCode: 502,
            body: JSON.stringify(error),
        };
    }
};

function getOutletInfo(outlet) {
    switch (outlet) {
        case "nyt":
            return {
                url: "https://www.nytimes.com/",
                tag: ".balancedHeadline",
            };
        case "wp":
            return {
                url: "https://www.washingtonpost.com/",
                tag: ".font--headline span",
            };
        default:
            console.warn("no outlet!");
    }
}

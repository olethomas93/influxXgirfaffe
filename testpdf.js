const puppeteer = require('puppeteer')
var fs = require('fs');

(async () => {
  // launch a new chrome instance
  const browser = await puppeteer.launch({
    headless: true
  })

  // create a new page
  const page = await browser.newPage()
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
  });
  // set your html as the pages content
  // const html = fs.readFileSync(`${__dirname}/build/index.html`, 'utf8')
  // await page.setContent(html, {
  //   waitUntil: 'networkidle0'
  // })
  // await page.waitForSelector('#root');

  // create a pdf buffer
 

  await page.setViewport({width:1745,height:771,deviceScaleFactor:1});
  const pdfBuffer = await page.pdf({
    format: 'A3'
  })


  const html2 = await page.evaluate(() => {
    return document.documentElement.innerHTML;
});

  // or a .pdf file
  await page.pdf({
    landscape:true,
    width: 1920,
    height:1080,
  
    path: `${__dirname}/my-fance-invoice.pdf`
  })

  // close the browser
  await browser.close()
})();
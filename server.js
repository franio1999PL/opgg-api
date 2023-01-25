const express = require('express')
// const { appendFile } = require('fs')
const cors = require('cors')

const puppeteer = require('puppeteer-extra')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin())

const app = express()

app.use(cors())

app.get('/', (req, res) => {
  const nickname = req.query.nickname
  const server = req.query.server

  exports.getStats = async (user, region) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        channel: 'chrome'
      })

      const context = browser.defaultBrowserContext()
      context.overridePermissions(`https://${region}.op.gg`, [
        'geolocation',
        'notifications'
      ])
      const page = await browser.newPage()

      await page.goto(`https://www.op.gg/summoners/${region}/${user}`)

      await page.waitForTimeout(1000)

      const level = await page
        .$eval('.level', e => e.innerText)
        .catch(() => {
          return 'Unknown'
        })
      const image = await page.$eval('.profile-icon img', e => e.src)
      const rank = await page
        .$eval('.tier', e => e.innerText)
        .catch(() => {
          return 'Unknown'
        })
      const lp = await page
        .$eval('.lp', e => e.innerText)
        .catch(() => {
          return 'Unknown'
        })
      const winrate = await page
        .$eval('.ratio', e => e.innerText)
        .catch(() => {
          return 'Unknown'
        })
      const winrateClean = winrate.replace('Win Rate ', '')
      const ladderRank = await page
        .$eval('span.ranking', e => e.innerText)
        .catch(() => {
          return 'Unknown'
        })

      const recentlyPlayedWith = await page
        .$$eval('.css-ut2tyh > table tbody tr', rows => {
          return Array.from(rows, row => {
            const columns = row.querySelectorAll('td')
            return Array.from(columns, column => column.innerText)
          })
        })
        .catch(err => {
          res.send('error do u need add nickname and server in query')
        })

      const stats = {
        SummonerName: user,
        Level: level,
        Rank: rank,
        LP: lp,
        WinRate: winrateClean,
        LadderRank: ladderRank,
        SummonerIcon: image,
        RecentlyPlayedWith: recentlyPlayedWith
      }

      console.log(stats)
      res.send(stats)

      await browser.close()
      return stats
    } catch (e) {
      console.error(e)
    }
  }

  this.getStats(nickname, server)
})

app.listen(3001, () => console.log('Listening on port 3001'))

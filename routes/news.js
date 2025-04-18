const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser();

router.get('/rss', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://vnexpress.net/rss/kinh-doanh.rss');
    res.json(feed.items.slice(0, 20)); // lấy n bài viết đầu
  } catch (err) {
    res.status(500).json({ error: 'Không thể lấy RSS' });
  }
});

module.exports = router;

 
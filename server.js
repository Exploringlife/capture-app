const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/capture', async (req, res) => {
  const { task, context, priority } = req.body;

  if (!task || !context || !priority) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: '30923c93339c806a8fe4dbfcd74a1f71' },
        properties: {
          'Task Name': {
            title: [{ text: { content: task } }]
          },
          'Context': {
            select: { name: context }
          },
          'Priority': {
            select: { name: priority }
          },
          'Status': {
            status: { name: 'Inbox' }
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'Notion API error' });
    }

    const data = await response.json();
    res.json({ success: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

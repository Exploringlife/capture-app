const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Never cache the HTML — always fetch fresh from server
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const PERSONAL_DB_ID = '30923c93339c806a8fe4dbfcd74a1f71';
const CC_DB_ID = 'f0782de63ac5429ba82f752c9cd8b48e';

async function notionPost(token, body) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw { status: response.status, message: error.message || 'Notion API error' };
  }

  return response.json();
}

app.post('/capture', async (req, res) => {
  const { task, context, priority, scope, owner, area } = req.body;

  if (!task || !context || !priority) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let data;

    if (context === 'Chef Collective') {
      if (!scope || !owner) {
        return res.status(400).json({ error: 'Scope and Owner are required for Chef Collective tasks' });
      }

      const token = process.env.CC_NOTION_TOKEN || process.env.NOTION_TOKEN;
      const properties = {
        'Task name': {
          title: [{ text: { content: task } }]
        },
        'Priority': {
          select: { name: priority }
        },
        'Scope': {
          select: { name: scope }
        },
        'Owner': {
          select: { name: owner }
        }
      };

      if (area) {
        properties['Area'] = { select: { name: area } };
      }

      data = await notionPost(token, {
        parent: { database_id: CC_DB_ID },
        properties
      });
    } else {
      const token = process.env.NOTION_TOKEN;
      data = await notionPost(token, {
        parent: { database_id: PERSONAL_DB_ID },
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
      });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

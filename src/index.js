const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const username = process.env.USERNAME || 'admin';
const password = process.env.PASSWORD || 'admin';

const db = new sqlite3.Database('./data/episodes.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the RunningMan episodes database.');
});

function authentication(req, res, next) {
  const authheader = req.headers.authorization;
  if (!authheader) {
    return res.status(401).send('You are not authenticated!');
  }
  const auth = new Buffer.from(authheader.split(' ')[1],
    'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];
  if (user == `${username}` && pass == `${password}`) {
    next();
  } else {
    return res.status(401).send('You are not authenticated!');
  }
}

app.use(express.json());

var last_episode;
var last_episode_title;
var next_episode;
var last_page;

db.get('SELECT episode,title FROM episodes ORDER BY episode DESC LIMIT 1;', (err, latest) => {
  if (err) {
    console.error(err.message);
    res.status(500).send('Internal server error');
  } else {
    last_episode = parseInt(latest['episode']);
    last_episode_title = latest['title'];
    next_episode = last_episode + 1;
    last_page = last_episode % 10 == 0 ? Math.floor(last_episode / 10) : Math.floor(last_episode / 10) + 1;
  }
});

app.get('/', (req, res) => {
  db.get('SELECT episode,title FROM episodes ORDER BY episode DESC LIMIT 1;', (err, latest) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      last_episode = parseInt(latest['episode']);
      last_episode_title = latest['title'];
      next_episode = last_episode + 1;
      last_page = last_episode % 10 == 0 ? Math.floor(last_episode / 10) : Math.floor(last_episode / 10) + 1;
    }
  });
  res.write('\nThe latest RunningMan episode is ' + last_episode + ' - ' + last_episode_title);
  res.write('\n\n# To get the title and link of RunningMan episode between 001 and ' + last_episode);
  res.write('\n$ curl -LX GET rm.freaks.dev/ep/001');
  res.write('\n\n# To add the title and link of RunningMan episode');
  res.write('\n$ curl --user username:password -LX POST -H "Content-Type: application/json" -d \'{"episode": "' + next_episode + '", "title": "title", "link": "link"}\' rm.freaks.dev/ep');
  res.write('\n\n# To update the title and link of RunningMan episode between 001 and ' + last_episode);
  res.write('\n$ curl --user username:password -LX PUT -H "Content-Type: application/json" -d \'{"title": "updated_title", "link": "updated_link"}\' rm.freaks.dev/ep/001');
  res.write('\n\n# To delete the RunningMan episode from the database');
  res.write('\n$ curl --user username:password -LX DELETE rm.freaks.dev/ep/001');
  res.write('\n\n# To view the RunningMan episode between 001 and ' + last_episode + ' directly in the browser');
  res.write('\n  https://rm.freaks.dev/ep/001?open=true');
  res.write('\n\n# To view the RunningMan episode list');
  res.write('\n$ curl -L rm.freaks.dev/ep');
  res.write('\n\n# To view the RunningMan episode list in the browser');
  res.write('\n  https://rm.freaks.dev/ep\n\n');
  res.send();
});

app.get('/ep', (req, res) => {
  const page = req.query.page;
  if (page) {
    db.all('SELECT * FROM episodes LIMIT 10 OFFSET ?;', [(page - 1) * 10], (err, rows) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal server error');
      } else if (page > last_page) {
        res.status(404).send('Page not found');
      } else {
        res.send(rows);
      }
    });
  } else {
    res.write('\nThe detail of 10 episodes will be show in a page.');
    res.write('\nThe current total episodes is ' + last_episode + '.');
    res.write('\nThe current total pages is ' + last_page + '.');
    res.write('\n\n# To list the RunningMan episodes of page ' + last_page);
    res.write('\n$ curl -L rm.freaks.dev/ep?page=' + last_page);
    res.write('\n\n# To list the RunningMan episodes of page ' + last_page + ' in browser');
    res.write('\n  https://rm.freaks.dev/ep?page=' + last_page);
    res.send();
  }
});

app.get('/ep/:episode', (req, res) => {
  const { episode } = req.params;
  const open = req.query.open;
  db.get('SELECT * FROM episodes WHERE episode = ?', [episode], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else if (!row) {
      res.status(404).send('Episode not found');
    } else if (open) {
      res.redirect(row['link']);
    } else {
      res.send(row);
    }
  });
});

app.post('/ep',authentication, (req, res) => {
  const { episode, title, link } = req.body;
  if (!episode || !title || !link) {
    res.status(400).send('Episode, title and link are required');
  } else {
    const sql = 'INSERT INTO episodes(episode, title, link) VALUES (?, ?, ?)';
    db.run(sql, [episode, title, link], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal server error');
      } else {
        res.status(201).send({ episode, title, link });
      }
    });
  }
});

app.put('/ep/:episode', authentication, (req, res) => {
  const { episode } = req.params;
  const { title, link } = req.body;
  if (!title || !link) {
    res.status(400).send('Title and link are required');
  } else {
    const sql = 'UPDATE episodes SET title = ?, link = ? WHERE episode = ?';
    db.run(sql, [title, link, episode], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal server error');
      } else if (this.changes === 0) {
        res.status(404).send('Episode not found');
      } else {
        res.status(200).send({ episode, title, link });
      }
    });
  }
});

app.delete('/ep/:episode', authentication, (req, res) => {
  const { episode } = req.params;
  db.run('DELETE FROM episodes WHERE episode = ?', [episode], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else if (this.changes === 0) {
      res.status(404).send('Episode not found');
    } else {
      res.status(204).send();
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});

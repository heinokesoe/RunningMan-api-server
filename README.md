This is the API server with the details of all the aired RunningMan episodes in the sql database.

**Demo:** https://rm.freaks.dev

#### Usage
To get the title and link of RunningMan episodes between 001 and the last aired episode:
```
curl -LX GET rm.freaks.dev/ep/001
```

To add the title and link of RunningMan episode:
```
curl --user username:password -LX POST -H "Content-Type: application/json" -d {"episode": "002", "title": "title", "link": "link"} rm.freaks.dev/ep
```

To update the title and link of RunningMan episode between 001 and the last aired episode:
```
curl --user username:password -LX PUT -H "Content-Type: application/json" -d {"title": "updated_title", "link": "updated_link"} rm.freaks.dev/ep/001
```

To delete the RunningMan episode from the database:
```
curl --user username:password -LX DELETE rm.freaks.dev/ep/002
```

To view the RunningMan episode between 001 and the last aired episode directly in the browser:
```
https://rm.freaks.dev/ep/001?open=true
```

To view the RunningMan episode list:
```
curl -L rm.freaks.dev/ep
```

To view the RunningMan episode list in the browser:
```
https://rm.freaks.dev/ep
```

#### Local Testing
With docker:
```
docker run --rm -d -p 3000:3000 heinokesoe/runningman-api-server:latest
```

With docker-compose:
```
docker-compose up -d
```

The default username and password is admin:admin

The API server will be running at http://localhost:3000

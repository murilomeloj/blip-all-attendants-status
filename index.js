const express = require('express');
const axios = require('axios');
const app = express();
const https = require('https')
const port = process.env.PORT;

app.use(express.json());
app.listen(port, () => {
  console.log("server is running");
});

const api = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
})
api.defaults.headers.common['Authorization'] = process.env.SECRET_API;

app.get("/getOnlineAgents", async (req, res) => {
  let { data } = await api.post('https://http.msging.net/commands', {
    "id": Math.floor(Date.now() * Math.random()).toString(36),
    "to": "postmaster@desk.msging.net",
    "method": "get",
    "uri": "/attendants",
  });
  let team = req.query.team;
  if (!team) {
    team = "Default";
  }

  let hasAttendant = false;
  if (data.resource && data.resource.total >= 1) {
    data.resource.items.some(function (attendant) {

      // check if there any attendant online on a team  
      attendant.teams.forEach(function (attendantTeam) {
        if (attendantTeam == team && attendant.status == "Online") {
          hasAttendant = true;
        }
      });

      // check if user's teams is attendant's email
      if (hasAttendant == false) {
        if (attendant.email == team && attendant.status == "Online") {
          hasAttendant = true;
        }
      }
    });
  }
  res.send({
    "response": data
  });
});

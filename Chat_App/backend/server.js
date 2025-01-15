const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Api is running');
});

app.get("/api/chat", (req, res) => {
    res.send('chats');
});

//app.get("/api/chat/:id", (req, res) => {
    //console.log(req.params.id);
    //const singlechat=chats.find((c) => c.id === req.params.id)
    //res.send(singlechat);
//});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

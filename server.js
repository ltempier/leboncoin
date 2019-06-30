

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";


const app = require('./express/server');

app.listen(process.env.PORT, process.env.IP, function (err) {
   if (err)
      console.error(err);
   else {
      console.log('server start on', process.env.IP + ':' + process.env.PORT)
   }
});
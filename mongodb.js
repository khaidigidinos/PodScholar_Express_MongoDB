const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://khai29012001:khainguyenminh@cluster0.gqngo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
  getDb: async function () {
    return await client.connect();
  },
};